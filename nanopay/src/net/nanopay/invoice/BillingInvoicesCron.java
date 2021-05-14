package net.nanopay.invoice;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.Address;
import foam.nanos.auth.User;
import foam.nanos.notification.Notification;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankHolidayService;
import net.nanopay.fx.ascendantfx.AscendantFXUser;
import net.nanopay.invoice.model.BillingInvoice;
import net.nanopay.tx.ComplianceTransaction;
import net.nanopay.tx.InvoicedFeeLineItem;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

import static foam.mlang.MLang.*;

/**
 * ================== BillingInvoicesCron ==================
 * This cron job will run on the first day of each month.
 * It will create a billing invoice on all transactions they have done in the
 * last month and send to each business.
 *
 * All Fees:
 * Domestic Transaction Fee:       $0.75/transaction
 * International Transaction Fee:  $5.00/transaction
 *
 * Promotion:
 * No charge for domestic transactions during the first three months based on
 * https://docs.google.com/spreadsheets/d/1FJLpasAJUDI-qvoS_RvAvyvw5kbHaUT_nsoX72xZTw4/edit#gid=1070899663
 */
public class BillingInvoicesCron implements ContextAgent {
  /**
   * The note displayed on the billing invoice
   */
  public static final String NOTE = "Please note, as per our Fee Schedule, the Monthly Invoice Fee amount, shown " +
    "above, will be debited by Ablii from the bank account assigned to your Ablii account. This amount will be " +
    "debited from your account on %tF. Please ensure you have enough funds in your bank account to cover the " +
    "transaction fees as displayed in the Monthly Invoice Fee amount. If you have any questions, please contact " +
    "our customer service at support@nanopay.net. ";

  /**
   * Start date of the billing
   */
  private final LocalDate startDate_;

  /**
   * End date of the billing
   */
  private final LocalDate endDate_;

  /**
   * Destination account
   */
  private final Account destinationAccount_;

  /**
   * The number of business days due before processing the invoices
   */
  private int dueIn_ = 5;

  /**
   * Dry run option
   */
  private boolean dryRun_ = false;

  /**
   * Result text generated after executing the agent
   */
  private StringBuilder result_ = new StringBuilder();

  /**
   * Error text when processing transactions
   */
  private StringBuilder error_ = new StringBuilder();

  /**
   * Spid to be billed
   */
  protected String spid_ = "nanopay";

  /**
   * Error notification group id
   */
  protected String errorNotificationGroupId_ = spid_ + "-payment-ops";

  /**
   * BillingInvoice by payer/business
   */
  private Map<Long, BillingInvoice> invoiceByPayer_ = new HashMap<>();

  /**
   * Invoice line items by payer/business.
   * Assuming one billing invoice per business.
   */
  private Map<Long, List<InvoiceLineItem>> invoiceLineItemByPayer_ = new HashMap<>();

  /**
   * Cached payment date by region to avoid going through bank holiday multiple times
   */
  private Map<Address, Date> paymentDateByRegion_ = new HashMap<>();

  /**
   * Predicate to add filter for transactions
   */
  private Predicate predicate_ = TRUE;

  /**
   * Fee exemption payer list
   */
  private Set<Long> exemptionPayerList_ = new HashSet<>();

  public BillingInvoicesCron(LocalDate startDate, LocalDate endDate, Account destinationAccount) {
    startDate_ = startDate;
    endDate_ = endDate;
    destinationAccount_ = destinationAccount;
  }

  public Map<Long, BillingInvoice> getInvoiceByPayer() {
    return invoiceByPayer_;
  }

  @Override
  public void execute(X x) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
    Date issueDate = new Date();

    error_.setLength(0);
    transactionDAO.where(AND(
      predicate_,
      EQ(Transaction.SPID, spid_),
      EQ(Transaction.STATUS, TransactionStatus.COMPLETED),
      GTE(Transaction.CREATED, getDate(startDate_)),
      LT(Transaction.CREATED, getDate(endDate_.plusDays(1)))
    )).select(new AbstractSink() {
      public void put(Object obj, Detachable sub) {
        Transaction transaction = (Transaction) obj;

        // Only want to charge fees on completed or declined Transaction chains

        Transaction ct = (Transaction) transactionDAO.find(AND(
          EQ(Transaction.PARENT, transaction.getId()),
          INSTANCE_OF(ComplianceTransaction.class)
        ));
        if ( ct != null && ct.getStatus() != TransactionStatus.COMPLETED ) {
          return;
        }

        Account sourceAccount = transaction.findSourceAccount(x);
        if ( sourceAccount == null ) {
          error_.append(" . id: ").append(transaction.getId())
                .append(" sourceAccount is missing\n");
          return;
        }
        User payer = sourceAccount.findOwner(x);
        long payerId = payer.getId();
        boolean isAscendantFXUser = null != ascendantFXUserDAO.find(
          EQ(AscendantFXUser.USER, payerId));
        BillingInvoice invoice = invoiceByPayer_.get(payerId);

        // Exclude fee for payer in the exemption list
        if ( exemptionPayerList_.contains(payerId) ) {
          return;
        }

        // Prevent charging fee on billing invoice transaction
        if ( transaction.findInvoiceId(x) instanceof BillingInvoice
          || transaction.getDestinationAccount().equals(destinationAccount_.getId() )
        ) {
          return;
        }

        if ( invoice == null ) {
          Date paymentDate = getPaymentDate(x, payer.getAddress(), issueDate);
          invoice = new BillingInvoice.Builder(x)
            .setIssueDate(new Date())
            .setPaymentDate(paymentDate)
            .setBillingStartDate(getDate(startDate_))
            .setBillingEndDate(getDate(endDate_))
            .setDueDate(paymentDate)
            .setPayerId(payerId)
            .setSourceCurrency(transaction.getSourceCurrency())
            .setDestinationAccount(destinationAccount_.getId())
            .setPayeeId(destinationAccount_.getOwner())
            .setDestinationCurrency(destinationAccount_.getDenomination())
            .setNote(String.format(NOTE, paymentDate))
            .build();
          BankAccount payerBankAccount = BankAccount.findDefault(x, payer, transaction.getSourceCurrency());
          if ( payerBankAccount != null ) {
            invoice.setAccount(payerBankAccount.getId());
          }
          invoiceByPayer_.put(payerId, invoice);
          invoiceLineItemByPayer_.put(payerId, new ArrayList<>());
        }

        List<InvoiceLineItem> invoiceLineItems = invoiceLineItemByPayer_.get(payerId);
        for (TransactionLineItem lineItem : transaction.getLineItems()) {
          if ( lineItem instanceof InvoicedFeeLineItem ) {
            long amount = check90DaysPromotion(payer, isAscendantFXUser, transaction) ? 0L : lineItem.getAmount();
            InvoiceLineItem invoiceLineItem = new InvoiceLineItem.Builder(x)
              .setTransaction(transaction.getId())
              .setGroup(isDomestic(transaction) ? "Domestic Payment Fee" : "International Payment Fee")
              .setDescription(String.format("%s → $%.2f %s",
                formatTransaction(x, transaction),
                amount / 100.0,
                lineItem.getCurrency()))
              .setAmount(amount)
              .setCurrency(lineItem.getCurrency())
              .build();
            invoiceLineItems.add(invoiceLineItem);
            invoice.setAmount(invoice.getAmount() + amount);
          }
        }
      }
    });

    result_.setLength(0);
    result_
      .append("Generate billing invoices (")
      .append(startDate_).append(" to ").append(endDate_).append("):\n");

    if ( dryRun_ )
      dryRunInvoices(x);
    else
      putInvoices(x);

    if ( error_.length() > 0 ) {
      result_
        .append("\nFailed to process transactions:\n")
        .append(error_.toString());
      if ( ! dryRun_ ) {
        ((DAO) x.get("localNotificationDAO")).put(
          new Notification.Builder(x)
            .setBody(result_.toString())
            .setNotificationType("BillingInvoicesCron")
            .setGroupId(errorNotificationGroupId_)
            .build());
      }
    }
  }

  public void setDueIn(int dueIn) {
    dueIn_ = dueIn;
  }

  public void setPredicate(Predicate predicate) {
    predicate_ = predicate;
  }

  public void addToExemptionPayerList(Long... payerIds) {
    Collections.addAll(exemptionPayerList_, payerIds);
  }

  public void setErrorNotificationGroupId(String groupId) {
    errorNotificationGroupId_ = groupId;
  }

  // Assume domestic transaction when sourceCurrency == destinationCurrency
  // TODO: use country corridor to determine domestic/international transaction
  public boolean isDomestic(Transaction transaction) {
    return transaction.getSourceCurrency().equals(transaction.getDestinationCurrency());
  }

  public String formatTransaction(X x, Transaction transaction) {
    long transactionAmount = transaction.getAmount();
    String transactionCurrency = transaction.getSourceCurrency();
    if ( ! isDomestic(transaction) ) {
      transactionAmount = transaction.getDestinationAmount();
      transactionCurrency = transaction.getDestinationCurrency();
    }
    Account destinationAccount = transaction.findDestinationAccount(x);
    User payee = destinationAccount.findOwner(x);

    return String.format("%tF - %s ($%.2f %s)",
      transaction.getCreated(),
      payee.getOrganization(),
      transactionAmount / 100.0,
      transactionCurrency);
  }

  public boolean check90DaysPromotion(User payer, boolean isAscendantFXUser, Transaction transaction) {
    // NOTE: There are some businesses that do not have CREATED date set (may be
    // due to issue with EasyDAO + CreatedAwareDAO previously), which is needed
    // for calculating the 90 days promotion eligibility.
    //
    // Businesses created on and after 2019-05-23 are having CREATED date set
    // properly. Thus, for businesses with missing CREATED date we are assuming
    // the businessCreated to be 2019-05-23 for the calculation.
    LocalDate businessCreated = LocalDate.of(2019, 5, 23);
    if ( payer.getCreated() != null ) {
      businessCreated = toLocalDate(payer.getCreated());
    }
    LocalDate transactionCreated = toLocalDate(transaction.getCreated());
    LocalDate jan1_2020 = LocalDate.of(2020, 1, 1);
    LocalDate dec1_2020 = LocalDate.of(2019, 12, 1);
    LocalDate oct1_2019 = LocalDate.of(2019, 10, 1);
    LocalDate sep16_2019 = LocalDate.of(2019, 9, 16);
    LocalDate sep1_2019 = LocalDate.of(2019, 9, 1);
    LocalDate jul1_2019 = LocalDate.of(2019, 7, 1);

    if ( ! transactionCreated.isBefore(jan1_2020) ) return false;
    if ( ! isDomestic(transaction) ) {
      return isAscendantFXUser
        && businessCreated.isBefore(sep16_2019)
        && transactionCreated.isBefore(oct1_2019);
    }

    // Domestic transaction
    if ( businessCreated.isBefore(jul1_2019) ) return transactionCreated.isBefore(oct1_2019);
    if ( businessCreated.isBefore(sep1_2019) ) return transactionCreated.isBefore(dec1_2020);
    if ( businessCreated.isBefore(sep16_2019) ) return transactionCreated.isBefore(jan1_2020);
    return false;
  }

  public Date getPaymentDate(X x, Address address, Date issueDate) {
    Address countryRegion = new Address.Builder(x)
      .setCountryId(address.getCountryId())
      .setRegionId(address.getRegionId())
      .build();
    Date paymentDate = paymentDateByRegion_.get(countryRegion);
    if ( paymentDate == null ) {
      BankHolidayService bankHolidayService = (BankHolidayService) x.get("bankHolidayService");
      paymentDate = bankHolidayService.skipBankHolidays(x, issueDate, countryRegion, dueIn_);
      paymentDateByRegion_.put(countryRegion, paymentDate);
    }
    return paymentDate;
  }

  public Date getDate(LocalDate localDate) {
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }

  public LocalDate toLocalDate(Date date) {
    return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
  }

  public void setDryRun(boolean dry_run) {
    dryRun_ = dry_run;
  }

  public boolean getDryRun() {
    return dryRun_;
  }

  public String getResult() {
    return result_.toString();
  }

  /**
   * Put invoices along with line items into DAO.
   */
  protected void putInvoices(X x) {
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    int i = 0;
    for ( BillingInvoice invoice : invoiceByPayer_.values() ) {
      if ( invoice.getAmount() == 0 ) continue;

      List<InvoiceLineItem> lineItems = invoiceLineItemByPayer_.get(invoice.getPayerId());
      invoice.setLineItems(lineItems.toArray(new InvoiceLineItem[lineItems.size()]));

      invoice.copyFrom(invoiceDAO.put_(x, invoice));
      result_.append(" . id: ").append(invoice.getId()).append("\n");
      ++i;
    }
    result_.append("\nDONE! ").append(i).append(" invoice(s) created.");
  }

  /**
   * dryRunInvoices(x) will save all the invoices generated into dryRunResult instead of putting them into DAO.
   */
  protected void dryRunInvoices(X x) {
    int i = 0;
    for ( BillingInvoice invoice : invoiceByPayer_.values() ) {
      if ( invoice.getAmount() == 0 ) continue;

      User payer = invoice.findPayerId(x);
      List<InvoiceLineItem> lineItems = invoiceLineItemByPayer_.get(invoice.getPayerId());

      String strPayer = " . " + payer.getOrganization() + " (id: " + payer.getId() + ")";
      String strLineItems = "   . " + lineItems.stream()
        .map(InvoiceLineItem::getDescription)
        .collect(Collectors.joining("\n   . "));
      result_
        .append(strPayer).append("\n")
        .append(strLineItems).append("\n");
      ++i;
    }
    result_.append("\nDRY_RUN! ").append(i).append(" invoice(s) to be created.");
  }
}
