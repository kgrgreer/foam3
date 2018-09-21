package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.dao.ArraySink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;

import java.util.List;
import net.nanopay.account.HoldingAccount;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.IN;
import static foam.mlang.MLang.OR;

public class HoldingAccountDAO
  extends ProxyDAO
{
  public final static String GLOBAL_TXN_READ = "transaction.read.*";

  public HoldingAccountDAO(DAO delegate) {
    setDelegate(delegate);
  }

  public HoldingAccountDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    // To cancel the holding trans.
    //  flow one, expired with cronJOb - distinguished
    //  flow two, Payer cancelled transaction
    // Steps to Process Cancel
    //  move the money back into PayerAccount
    // send email notifying payee invoice/payment was cancelled

    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());
    DAO transactionDAO_ = (DAO) x.get("localTransactionDAO");

    // If this is the first put.
    if ( existingInvoice == null ) {
      return super.put_(x, obj);
    }

    // Else check if cancelling payment is required
    PaymentStatus newStatus = invoice.getPaymentMethod();
    PaymentStatus oldStatus = existingInvoice.getPaymentMethod();
    boolean invoiceCancelHolding = 
        (newStatus == PaymentStatus.NONE)
        &&
        (oldStatus == PaymentStatus.HOLDING);
    //String initTxnId = invoice.getPaymentId();
    // TODO check only one transaction
    Transaction initTxn = transactionDAO_.find(invoice.getPaymentId());


    // Cancel Holding account invoice
    if ( invoiceCancelHolding && initTxn != null ) {
      User user = (User) x.get("user");
      Account dstAcct;
      Account srcAcct;
        // Check if all necessary Fields are set
        boolean checkFields = ( 
          (dstAcct = initTxn.getDestinationAccount() != null)
            && 
          (srcAcct = initTxn.getSourceAccount() != null)
            &&
          initTxn.getDestinationCurrency() != null
            &&
          initTxn.getSourceCurrency() != null
            && 
          srcAcct.getOwner() == user.getId() // TODO: check if this is necessary
            &&
          dstAcct instanceof HoldingAccount
          );

        if ( checkFields ) {
          Transaction t = new Transaction();
          t.setDestinationAccount(srcAcct);
          t.setSourceAccount(dstAcct);
          t.setAmount(invoice.getAmount());
          t.setType(TransactionType.CASHOUT);
          t.setStatus(TransactionStatus.COMPLETED);
          transactionDAO_.put(t);
          invoice.setPaymentMethod(PaymentStatus.NONE);
        }
    }
    return getDelegate().put_(x, obj);
  }
}
