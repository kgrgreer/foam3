package net.nanopay.invoice;

import foam.core.ContextAgent;
import foam.core.Detachable;
import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.DAO;
import foam.nanos.auth.Address;
import net.nanopay.account.Account;
import net.nanopay.bank.BankHolidayService;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Business;
import net.nanopay.tx.InvoicedFeeLineItem;
import net.nanopay.tx.TransactionLineItem;
import net.nanopay.tx.model.Transaction;

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
public class AbliiBillingCron implements ContextAgent {
  /**
   * Nanopay fee account id used for billing
   */
  private final long NANOPAY_FEE_ACCOUNT_ID = 2;

  /**
   * Due in business days for invoice dueDate and paymentDate
   */
  private final int DUE_IN_BUSINESS_DAYS = 5;

  /**
   * Start date of the billing
   */
  private final LocalDate startDate_;

  /**
   * End date of the billing
   */
  private final LocalDate endDate_;

  /**
   * Invoice by payer/business
   */
  private Map<Long, Invoice> invoiceByPayer_ = new HashMap<>();

  /**
   * Line item by payer/business.
   * Assuming one billing invoice per business.
   */
  private Map<Invoice, List<InvoiceLineItem>> lineItemByPayer_ = new HashMap<>();

  /**
   * Cached payment date by region to avoid going through bank holiday multiple times
   */
  private Map<Address, Date> paymentDateByRegion_ = new HashMap<>();

  public AbliiBillingCron(LocalDate startDate, LocalDate endDate) {
    startDate_ = startDate;
    endDate_ = endDate;
  }

  @Override
  public void execute(X x) {
    DAO accountDAO = (DAO) x.get("localAccountDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");
    Account feeAccount = (Account) accountDAO.find(NANOPAY_FEE_ACCOUNT_ID);
    Date issueDate = new Date();

    transactionDAO.where(AND(
      OR(
        INSTANCE_OF(net.nanopay.tx.SummaryTransaction.class),
        INSTANCE_OF(net.nanopay.fx.FXSummaryTransaction.class)
      ),
      GTE(Transaction.CREATED, getDate(startDate_)),
      LT(Transaction.CREATED, getDate(endDate_.plusDays(1)))
    )).select(new AbstractSink() {
      public void put(Object obj, Detachable sub) {
        Transaction transaction = (Transaction) ((Transaction) obj).fclone();
        Account sourceAccount = transaction.findSourceAccount(x);
        Business business = (Business) sourceAccount.findOwner(x);
        Invoice invoice = invoiceByPayer_.get(business.getId());
        if ( invoice == null ) {
          Date paymentDate = getPaymentDate(x, business.getAddress(), issueDate);
          invoice = new Invoice.Builder(x)
            .setIssueDate(new Date())
            .setPaymentDate(paymentDate)
            .setDueDate(paymentDate)
            .setPayerId(business.getId())
            .setSourceCurrency(transaction.getSourceCurrency())
            .setDestinationAccount(feeAccount.getId())
            .setPayeeId(feeAccount.getOwner())
            .setDestinationCurrency(feeAccount.getDenomination())
            .build();
          invoiceByPayer_.put(business.getId(), invoice);
          lineItemByPayer_.put(invoice, new ArrayList<>());
        }

        List<InvoiceLineItem> invoiceLineItems = lineItemByPayer_.get(invoice);
        for (TransactionLineItem lineItem : transaction.getLineItems()) {
          if ( lineItem instanceof InvoicedFeeLineItem ) {
            long amount = check90DaysPromotion(business, transaction) ? 0l : lineItem.getAmount();
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

  // QUESTION: Can isDomestic a transient property on Transaction?
  private boolean isDomestic(Transaction transaction) {
    return transaction.getSourceCurrency().equals(transaction.getDestinationCurrency());
  }

  private boolean check90DaysPromotion(Business business, Transaction transaction) {
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
      return businessCreated.isBefore(feb1_2019)
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
      paymentDate = bankHolidayService.skipBankHolidays(x, issueDate,
        countryRegion, DUE_IN_BUSINESS_DAYS);
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
    for ( Map.Entry<Long, Invoice> entry : invoiceByPayer_.entrySet() ) {
      Invoice invoice = entry.getValue();
      List<InvoiceLineItem> lineItems = lineItemByPayer_.get(invoice);
      invoice.setLineItems(lineItems.toArray(new InvoiceLineItem[lineItems.size()]));
      long totalAmount = 0;
      for ( InvoiceLineItem lineItem : lineItems ) {
        totalAmount += lineItem.getAmount();
      }
      invoice.setAmount(totalAmount);
      invoiceDAO.put(invoice);
    }
  }
}
