package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.alterna.CsvUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;

import java.util.Calendar;
import java.util.Date;
import java.util.List;

public class UpdateInvoiceTransactionDAO extends ProxyDAO {
  public UpdateInvoiceTransactionDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    Invoice invoice = transaction.findInvoiceId(x);

    if ( transaction.getInvoiceId() != 0 ) {
      if ( invoice == null ) {
        throw new RuntimeException("Invoice with id " + transaction.getInvoiceId() + " not found.");
      } else if ( invoice.getStatus() == InvoiceStatus.PAID && transaction.getStatus() != TransactionStatus.DECLINED ) {
        throw new RuntimeException("Invoice already paid.");
      }
    }

    FObject ret = super.put_(x, obj);

    Account sourceAccount = transaction.findSourceAccount(x);
    Account destinationAccount = transaction.findDestinationAccount(x);
    if ( transaction.getInvoiceId() != 0 ) {
      DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
      TransactionStatus status = transaction.getState(getX());
      if ( SafetyUtil.isEmpty(invoice.getPaymentId()) && SafetyUtil.isEmpty(transaction.getParent()) ) {
        invoice.setPaymentId(transaction.getId());
        invoiceDAO.put(invoice);
      }
      if ( (status == TransactionStatus.SENT || status == TransactionStatus.PENDING ) &&
          sourceAccount instanceof DigitalAccount && sourceAccount.getOwner() == invoice.getPayerId() && ! ( transaction instanceof AscendantFXTransaction )) {
        // User accepting a payment that was sent to a Contact or User with no BankAccount.
        invoice.setPaymentMethod(PaymentStatus.DEPOSIT_MONEY);
        invoiceDAO.put(invoice);
      } else if ( (status == TransactionStatus.SENT || status == TransactionStatus.PENDING ) &&
          destinationAccount instanceof DigitalAccount && sourceAccount.getOwner() == invoice.getPayerId() &&
          destinationAccount.getOwner() == invoice.getPayerId()) {
        // Existing user sending money to a contact or user with no BankAccount.
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.TRANSIT_PAYMENT);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.COMPLETED && destinationAccount instanceof DigitalAccount &&
          sourceAccount.getOwner() == invoice.getPayerId() && destinationAccount.getOwner() == invoice.getPayerId()) {
        // Existing user sending money to a contact or user with no BankAccount.
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.DEPOSIT_PAYMENT);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.SENT  && transaction instanceof AscendantFXTransaction) {
        invoice.setPaymentDate(transaction.getCompletionDate());
        invoice.setPaymentMethod(PaymentStatus.TRANSIT_PAYMENT);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.COMPLETED ) {
        Calendar curDate = Calendar.getInstance();
        invoice.setPaymentDate(curDate.getTime());
        invoice.setPaymentMethod(PaymentStatus.NANOPAY);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.PENDING ) {
        invoice.setPaymentDate(generateEstimatedCreditDate());
        invoice.setPaymentMethod(PaymentStatus.PENDING);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.DECLINED || status == TransactionStatus.REVERSE || status == TransactionStatus.REVERSE_FAIL ) {
        invoice.setPaymentDate(null);
        invoice.setPaymentMethod(PaymentStatus.NONE);
        invoiceDAO.put(invoice);
      }
    }

    return ret;
  }

  private Date generateEstimatedCreditDate() {
    List<Integer> cadHolidays = CsvUtil.cadHolidays;
    Calendar dateTime = Calendar.getInstance();
    int businessDays = 4; // next 4 business days
    int i = 0;
    while ( i < businessDays ) {
      dateTime.add(Calendar.DAY_OF_YEAR, 1);
      if ( dateTime.get(Calendar.DAY_OF_WEEK) != Calendar.SATURDAY
        && dateTime.get(Calendar.DAY_OF_WEEK) != Calendar.SUNDAY
        && ! cadHolidays.contains(dateTime.get(Calendar.DAY_OF_YEAR)) ) {
        i = i + 1;
      }
    }
    return dateTime.getTime();
  }
}
