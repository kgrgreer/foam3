package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.account.HoldingAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

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
      TransactionStatus status = transaction.getStatus();
      if ( status == TransactionStatus.SENT && sourceAccount instanceof DigitalAccount && sourceAccount.getOwner() == invoice.getPayerId() ) {
        // User accepting a payment that was sent to a Contact or User with no BankAccount.
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentMethod(PaymentStatus.DEPOSIT_MONEY);
        invoiceDAO.put(invoice);
      } else if ( (status == TransactionStatus.COMPLETED || status == TransactionStatus.SENT) && 
          destinationAccount instanceof DigitalAccount && sourceAccount.getOwner() == invoice.getPayerId() && destinationAccount.getOwner() == invoice.getPayerId()) {
        // Existing user sending money to a contact or user with no BankAccount.
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.DEPOSIT_PAYMENT);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.COMPLETED ) {
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.NANOPAY);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.PENDING ) {
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.PENDING);
        invoiceDAO.put(invoice);
      } else if ( status == TransactionStatus.DECLINED || status == TransactionStatus.REVERSE || status == TransactionStatus.REVERSE_FAIL ) {
        invoice.setPaymentId(null);
        invoice.setPaymentDate(null);
        invoice.setPaymentMethod(PaymentStatus.NONE);
        invoiceDAO.put(invoice);
      }
    }

    return ret;
  }
}
