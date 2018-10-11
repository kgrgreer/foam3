package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.*;
import foam.nanos.auth.User;
import java.util.List;
import net.nanopay.account.Account;
import net.nanopay.account.HoldingAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import static foam.mlang.MLang.*;

/**
 * When a user pays an invoice where the payee is a contact their money gets put
 * in a holding account until the external user either accepts the payment,
 * rejects it, or some period of time passes and the payment expires. In the
 * second and third cases, the money needs to move out of the holding account
 * and go back to the payer.
 *
 * This decorator moves the money out of the holding account and gives it back
 * to the payer when it is appropriate to do so.
 */
public class RevertInvoicePaymentInHoldingAccountDecorator
  extends ProxyDAO
{

  public RevertInvoicePaymentInHoldingAccountDecorator(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());
    DAO transactionDAO = (DAO) x.get("transactionDAO");
    DAO localAccountDAO = (DAO) x.get("localAccountDAO");

    if ( existingInvoice == null ) {
      return super.put_(x, obj);
    }

    // Check 1) Do cancelling payment flags exist
    PaymentStatus newStatus = invoice.getPaymentMethod();
    PaymentStatus oldStatus = existingInvoice.getPaymentMethod();
    boolean invoiceCancelHolding = newStatus == PaymentStatus.NONE && oldStatus == PaymentStatus.HOLDING;

    // Check 2) Confirm a transaction to holding account exists
    Transaction initialTxn = (Transaction) transactionDAO.find(invoice.getPaymentId());

    if ( initialTxn != null && invoiceCancelHolding ) {
      Account dstAcct = (Account) localAccountDAO.find_(x, initialTxn.getDestinationAccount());
      Account srcAcct = (Account) localAccountDAO.find_(x, initialTxn.getSourceAccount());

      // Check 3) Confirm that the last transaction was into a holding account.
      // Check 4) Confirm that the owner of the destination account is the same as
      // the owner of the source account.
      if ( dstAcct instanceof HoldingAccount && dstAcct.getOwner() == srcAcct.getOwner() ) {

        // Check 5) Check if there are other transactions associated with this holding account.
        Sink transactions = new ArraySink();
        transactions = transactionDAO.where(EQ(Transaction.INVOICE_ID, initialTxn.getInvoiceId())).select(transactions);
        List list = ((ArraySink) transactions).getArray();

        if ( list.size() == 1 ) {
          Transaction t = new Transaction();
          t.setDestinationAccount(srcAcct.getId());
          t.setSourceAccount(dstAcct.getId());
          t.setAmount(initialTxn.getAmount());

          transactionDAO.put_(x, t);

          // Send an email to the payee telling them the payment was cancelled.
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
