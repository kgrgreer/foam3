package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.util.SafetyUtil;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.alterna.CsvUtil;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.fx.ascendantfx.AscendantFXTransaction;

import java.util.*;

public class UpdateInvoiceTransactionDAO extends ProxyDAO {
  public UpdateInvoiceTransactionDAO(X x, DAO delegate) {
    setDelegate(delegate);
    setX(x);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    Transaction parent = (Transaction) obj;

    while ( ! SafetyUtil.isEmpty(parent.getParent()) ) {
      parent = parent.findParent(getX());
    }

    Invoice invoice = parent.findInvoiceId(x);

    if ( parent.getInvoiceId() != 0 ) {
      if ( invoice == null ) {
        throw new RuntimeException("Invoice with id " + parent.getInvoiceId() + " not found.");
      } else if ( invoice.getStatus() == InvoiceStatus.PAID && parent.getStatus() != TransactionStatus.DECLINED && transaction instanceof AbliiTransaction) {
        throw new RuntimeException("Invoice already paid.");
      }

      DAO invoiceDAO = ((DAO) x.get("invoiceDAO")).inX(x);
      TransactionStatus status = transaction.getState(getX());

      if ( SafetyUtil.isEmpty(invoice.getPaymentId()) ) {
        invoice.setPaymentId(parent.getId());
        invoiceDAO.put(invoice);
      }

      if ( status == TransactionStatus.COMPLETED ) {
        Calendar curDate = Calendar.getInstance();
        invoice.setPaymentDate(curDate.getTime());
        invoice.setPaymentMethod(PaymentStatus.NANOPAY);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.SENT && transaction instanceof AscendantFXTransaction ) {
        invoice.setPaymentDate(transaction.getCompletionDate());
        invoice.setPaymentMethod(PaymentStatus.PROCESSING);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.PENDING_PARENT_COMPLETED || status == TransactionStatus.PENDING ) {
        invoice.setPaymentDate(generateEstimatedCreditDate());
        invoice.setPaymentMethod(PaymentStatus.PROCESSING);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.DECLINED || status == TransactionStatus.REVERSE || status == TransactionStatus.REVERSE_FAIL ) {
        // Do nothing. Our team will investigate and then manually set the status of the invoice.

        HashMap<String, Object> args = new HashMap();
        args.put("transactionId", transaction.getId());
        args.put("invoiceId", invoice.getId());

        // Send a notification to the payment-ops team.
        FailedTransactionNotification notification = new FailedTransactionNotification.Builder(x)
          .setTransactionId(transaction.getId())
          .setInvoiceId(invoice.getId())
          .setEmailArgs(args)
          .build();
        DAO notificationDAO = ((DAO) x.get("notificationDAO")).inX(x);
        notificationDAO.put(notification);
      }
    }

    return super.put_(x, obj);
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
