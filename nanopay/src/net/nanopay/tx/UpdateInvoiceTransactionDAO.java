package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.account.Account;
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
    DAO invoiceDAO = (DAO) x.get("invoiceDAO");

    Invoice invoice = (Invoice) invoiceDAO.find_(x, transaction.getInvoiceId());
    FObject ret = super.put_(x, obj);
    Account sourceAccount = transaction.findSourceAccount(x);
    Account destinationAccount = transaction.findDestinationAccount(x);

    // transaction.getInvoiceId() == 0 when new transaction 
    if ( transaction.getInvoiceId() != 0 ) {
      // Error Checking
      if ( invoice == null ) {
        throw new RuntimeException("Invoice with id " + transaction.getInvoiceId() + " not found.");
      } else if ( invoice.getStatus() == InvoiceStatus.PAID && transaction.getStatus() != TransactionStatus.DECLINED ) {
        throw new RuntimeException("Invoice already paid.");
      }
      // Case Checking
      if ( // Case 1)
      transaction.getStatus() == TransactionStatus.COMPLETED 
      && 
      sourceAccount instanceof HoldingAccount 
      && 
      ! (destinationAccount instanceof HoldingAccount)) {
        // Existing User taking payment that was sent to a Contact
        // Case 1A) When transaction to Contact was Canceled or Expired - do not change status
        // Or, Case 1B) This could happen when Contact Signs Up and accepts payment - below status change
        if (sourceAccount.getOwner() != destinationAccount.getOwner()) {
          invoice.setPaymentMethod(PaymentStatus.NANOPAY);
        }
        invoice.setPaymentId(transaction.getId());
        invoiceDAO.put_(x, invoice);
      } else if ( // Case 2)
      transaction.getStatus() == TransactionStatus.COMPLETED 
      && 
      destinationAccount instanceof HoldingAccount ) {
        // Existing User sending money to a Contact.
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.HOLDING);
        invoiceDAO.put_(x, invoice);
      } else if (  // Case 3)
      transaction.getStatus() == TransactionStatus.COMPLETED ) {
        // Basic Transaction to and from existing Users
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.NANOPAY);
        invoiceDAO.put_(x, invoice);
      } else if (  // Case 4)
      transaction.getStatus() == TransactionStatus.PENDING ) {
        // Basic Transaction to and from existing Users
        invoice.setPaymentId(transaction.getId());
        invoice.setPaymentDate(transaction.getLastModified());
        invoice.setPaymentMethod(PaymentStatus.PENDING);
        invoiceDAO.put_(x, invoice);
      } else if (  // Case 5)
      transaction.getStatus() == TransactionStatus.DECLINED ) {
        // Basic Transaction to and from existing Users
        invoice.setPaymentId(null);
        invoice.setPaymentDate(null);
        invoice.setPaymentMethod(PaymentStatus.NONE);
        invoiceDAO.put_(x, invoice);
      }
    }
    return ret;
  }
}
