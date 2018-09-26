package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import static foam.mlang.MLang.*;
import foam.nanos.auth.User;
import net.nanopay.account.Account;
import net.nanopay.account.HoldingAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import java.util.List;

public class RevertInvoicePaymentInHoldingAccountDecorator
  extends ProxyDAO
{

  public RevertInvoicePaymentInHoldingAccountDecorator(DAO delegate) {
    setDelegate(delegate);
  }

  public RevertInvoicePaymentInHoldingAccountDecorator(X x, DAO delegate) {
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
    //    -decorator on transaction - UpdatedInviceTransactionDAO
    //  send email notification to initial payee that payment was cancelled
    //    - TODO:

    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());
    DAO transactionDAO_ = (DAO) x.get("transactionDAO");
    DAO accountDAO_ = (DAO) x.get("localAccountDAO");

    // If this is the first put.
    if ( existingInvoice == null ) {
      return super.put_(x, obj);
    }

    // Check 1) Do cancelling payment flags exist
    PaymentStatus newStatus = invoice.getPaymentMethod();
    PaymentStatus oldStatus = existingInvoice.getPaymentMethod();
    boolean invoiceCancelHolding = 
        (newStatus == PaymentStatus.NONE)
        &&
        (oldStatus == PaymentStatus.HOLDING);
    // Check 2) Confirm a transaction to holding account exists
    Transaction initialTxn = (Transaction) transactionDAO_.find(invoice.getPaymentId());

    if ( initialTxn != null && invoiceCancelHolding ) { 
      Account dstAcct = (Account) accountDAO_.find(initialTxn.getDestinationAccount());
      Account srcAcct = (Account) accountDAO_.find(initialTxn.getSourceAccount());
      // Check 3) Confirm the last transaction was into a HoldingAccount
      // Check 4) Confirm Owner of dstAccount is the same as Owner of srcAccount
      if ( dstAcct instanceof HoldingAccount && dstAcct.getOwner() == srcAcct.getOwner() ) {    
        // Check 5) Check if there are other transactions associated with this HoldingAccount...
        // do this by checking if this invoice has other Transactions associated with it  'if ( trans.getArray().size() == 1 )'
        Sink trans = new ArraySink();
        trans = transactionDAO_.where(EQ(Transaction.INVOICE_ID, initialTxn.getInvoiceId())).select(trans);

        List list = ((ArraySink) trans).getArray();
        if ( list.size() == 1 ) {
          Transaction t = new Transaction();
          t.setDestinationAccount(srcAcct.getId());
          t.setSourceAccount(dstAcct.getId());
          t.setAmount(initialTxn.getAmount());
          if ( dstAcct instanceof BankAccount ) {
            t.setType(TransactionType.CASHOUT);
          } else {
            t.setType(TransactionType.NONE);
          }
          transactionDAO_.put(t); 
          // Send email notices of canceled payment
          /* TODO: UNCOMMENT BELOW FOR EMAIL SERVICE - NEEDS A TEMPLATE TO SEND */
          // EmailService email   = (EmailService) x.get("email");
          // EmailMessage message = new EmailMessage();
          // AppConfig    config  = (AppConfig) x.get("appConfig");
          // message.setTo(new String[] {user.getEmail() });
          // HashMap<String, Object> args = new HashMap<>();
          // args.put("name", user.getFirstName());
          // email.sendEmailFromTemplate(user, message, " ***** ", args);
        }
      }
    }
    return getDelegate().put_(x, obj);
  }
}
