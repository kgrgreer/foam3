package net.nanopay.invoice;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import net.nanopay.account.Account;
import net.nanopay.bank.BankHolidayService;
import net.nanopay.fx.ascendantfx.AscendantFXUser;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.model.Business;
import net.nanopay.tx.InvoicedFeeLineItem;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

import static foam.mlang.MLang.*;

/**
 * ================== AbliiBillingCron ==================
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
  private final int dueIn_;

  /**
   * Invoice by payer/business
   */
  private Map<Long, Invoice> invoiceByPayer_ = new HashMap<>();

  /**
   * Invoice line items by payer/business.
   * Assuming one billing invoice per business.
   */
  private Map<Long, List<InvoiceLineItem>> invoiceLineItemByPayer_ = new HashMap<>();

  /**
   * Cached payment date by region to avoid going through bank holiday multiple times
   */
  private Map<Address, Date> paymentDateByRegion_ = new HashMap<>();

  public BillingInvoicesCron(LocalDate startDate, LocalDate endDate, Account destinationAccount, int dueIn) {
    startDate_ = startDate;
    endDate_ = endDate;
    destinationAccount_ = destinationAccount;
    dueIn_ = dueIn;
  }

  public Map<Long, Invoice> getInvoiceByPayer() {
    return invoiceByPayer_;
  }

  @Override
  public void execute(X x) {
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    DAO ascendantFXUserDAO = (DAO) x.get("ascendantFXUserDAO");
    Date issueDate = new Date();

    transactionDAO.where(AND(
      EQ(Transaction.STATUS, TransactionStatus.COMPLETED),
      GTE(Transaction.CREATED, getDate(startDate_)),
      LT(Transaction.CREATED, getDate(endDate_.plusDays(1)))
    )).select(new AbstractSink() {
      public void put(Object obj, Detachable sub) {
        Transaction transaction = (Transaction) ((Transaction) obj).fclone();
        Account sourceAccount = transaction.findSourceAccount(x);
        Business business = (Business) sourceAccount.findOwner(x);
        long payerId = business.getId();
        boolean isAscendantFXUser = null != ascendantFXUserDAO.find(
          EQ(AscendantFXUser.USER, payerId));
        Invoice invoice = invoiceByPayer_.get(payerId);
        if ( invoice == null ) {
          Date paymentDate = getPaymentDate(x, business.getAddress(), issueDate);
          invoice = new Invoice.Builder(x)
            .setIssueDate(new Date())
            .setPaymentDate(paymentDate)
            .setDueDate(paymentDate)
            .setPayerId(payerId)
            .setSourceCurrency(transaction.getSourceCurrency())
            .setDestinationAccount(destinationAccount_.getId())
            .setPayeeId(destinationAccount_.getOwner())
            .setDestinationCurrency(destinationAccount_.getDenomination())
            .build();
          invoiceByPayer_.put(payerId, invoice);
          invoiceLineItemByPayer_.put(payerId, new ArrayList<>());
        }

        List<InvoiceLineItem> invoiceLineItems = invoiceLineItemByPayer_.get(payerId);
        for (TransactionLineItem lineItem : transaction.getLineItems()) {
          if ( lineItem instanceof InvoicedFeeLineItem ) {
            long amount = check90DaysPromotion(business, isAscendantFXUser, transaction) ? 0L : lineItem.getAmount();
            InvoiceLineItem invoiceLineItem = new InvoiceLineItem.Builder(x)
              .setTransaction(transaction.getId())
              .setGroup(isDomestic(transaction) ? "Domestic Payment Fee" : "International Payment Fee")
              .setDescription("Fee charged for transaction " + transaction.getId())
              .setAmount(amount)
              .setCurrency(lineItem.getCurrency())
              .build();
            invoiceLineItems.add(invoiceLineItem);
          }
        }
      }
    });
    putInvoices(x);
  }

  // Assume domestic transaction when sourceCurrency == destinationCurrency
  // TODO: use country corridor to determine domestic/international transaction
  private boolean isDomestic(Transaction transaction) {
    return transaction.getSourceCurrency().equals(transaction.getDestinationCurrency());
  }

  private boolean check90DaysPromotion(Business business, boolean isAscendantFXUser, Transaction transaction) {
    LocalDate businessCreated = toLocalDate(business.getCreated());
    LocalDate transactionCreated = toLocalDate(transaction.getCreated());
    LocalDate jan1_2020 = LocalDate.of(2020, 1, 1);
    LocalDate dec1_2020 = LocalDate.of(2019, 12, 1);
    LocalDate oct1_2019 = LocalDate.of(2019, 10, 1);
    LocalDate sep16_2019 = LocalDate.of(2019, 9, 16);
    LocalDate sep1_2019 = LocalDate.of(2019, 9, 1);
    LocalDate jul1_2019 = LocalDate.of(2019, 7, 1);
    LocalDate feb1_2019 = LocalDate.of(2019, 2, 1);

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

  private Date getPaymentDate(X x, Address address, Date issueDate) {
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

  private Date getDate(LocalDate localDate) {
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }

  private LocalDate toLocalDate(Date date) {
    return date.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
  }

  /**
   * Put invoices along with line items into DAO.
   */
  private void putInvoices(X x) {
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");
    for ( Invoice invoice : invoiceByPayer_.values() ) {
      List<InvoiceLineItem> lineItems = invoiceLineItemByPayer_.get(invoice.getPayerId());
      invoice.setLineItems(lineItems.toArray(new InvoiceLineItem[lineItems.size()]));
      long amount = lineItems.stream().mapToLong(li -> li.getAmount())
        .reduce(0, Long::sum);
      if ( amount == 0 ) {
        invoice.setPaymentMethod(PaymentStatus.NANOPAY);
      }
      invoice.setAmount(amount);
      invoiceDAO.put_(x, invoice);
    }
  }
}
