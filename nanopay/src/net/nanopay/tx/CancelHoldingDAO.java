package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.account.HoldingAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.List;

public class CancelHoldingDAO
  extends ProxyDAO
{
  public final static String GLOBAL_TXN_READ = "transaction.read.*";

  public CancelHoldingDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public CancelHoldingDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    // To cancel the holding trans.
    //  flow one, expired with cronJOb
    //  flow two, Payer cancelled transaction
    // Steps to Process Cancel
    //  move the money back into PayerAccount
    //    -decorator on transaction - UpdatedInviceTransactionDAO - resets Invoice fields 
    //  send email notification to initial payee payment was cancelled
    //    - TODO:

    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());
    DAO transactionDAO_ = (DAO) x.get("localTransactionDAO");
    DAO accontDAO_ = (DAO) x.get("localAccountDAO");

    // If this is the first put.
    if ( existingInvoice == null ) {
      return super.put_(x, obj);
    }
    // Else check if cancelling payment is required
    PaymentStatus newStatus = invoice.getPaymentMethod();
    PaymentStatus oldStatus = existingInvoice.getPaymentMethod();
    boolean invoiceCancelHolding = 
        (newStatus == PaymentStatus.CANCEL)
        &&
        (oldStatus == PaymentStatus.HOLDING);
    Transaction initialTxn = (Transaction)transactionDAO_.find(invoice.getPaymentId());

    // Cancel Holding account invoice
    if ( invoiceCancelHolding && initialTxn != null ) {
      User user = (User) x.get("user");
      Account dstAcct = null;
      Account srcAcct = null;
        // Check if all necessary Fields are available
        boolean checkFields = ( 
          ((dstAcct = (Account)accontDAO_.find(initialTxn.getDestinationAccount())) != null)
            && 
          ((srcAcct = (Account)accontDAO_.find(initialTxn.getSourceAccount())) != null)
            &&
          initialTxn.getDestinationCurrency() != null
            &&
          initialTxn.getSourceCurrency() != null
            && 
          srcAcct.getOwner() == user.getId() // TODO: ask if this is necessary
            &&
          dstAcct instanceof HoldingAccount
          );

        if ( checkFields ) {
          Transaction t = new Transaction();
          t.setDestinationAccount(srcAcct.getId());
          t.setSourceAccount(dstAcct.getId());
          t.setAmount(initialTxn.getAmount());
          t.setType(TransactionType.CASHOUT);
          transactionDAO_.put(t);
          t.setStatus(TransactionStatus.COMPLETED);
          transactionDAO_.put(t); // Two puts to get through logic: if ( transaction.getInvoiceId() != 0 ) -> under UpdateInvoiceTransactionDAO.java
        }
        // TODO: send email notices of canceled payment
    }
    return getDelegate().put_(x, obj);
  }
}
