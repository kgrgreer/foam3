package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.text.NumberFormat;
import java.util.HashMap;
import net.nanopay.tx.model.Transaction;

// Sends an email when an invoice is PAID
public class PaidTransactionDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public PaidTransactionDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {

    // Sets the decorator to run on the return phase of the DAO call
    Transaction transaction = (Transaction) super.put_(x, obj);

    // Returns if transaction is a transfer
    if ( transaction.getInvoiceId() == 0 )
      return transaction;

    // Returns if transaction is a cico transaction
    if ( transaction.getPayeeId() == transaction.getPayerId() )
      return transaction;

    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    AppConfig    config    = (AppConfig) x.get("appConfig");
    User         user      = (User) userDAO_.find_(x, transaction.getPayeeId());
    User         sender    = (User) userDAO_.find_(x, transaction.getPayerId());
    EmailService email     = (EmailService) x.get("email");
    EmailMessage message   = new EmailMessage();

    message.setTo(new String[]{user.getEmail()});
    HashMap<String, Object> args = new HashMap<>();

    // Loads variables that will be represented in the email received
    args.put("amount",    formatter.format(transaction.getAmount()/100.00));
    args.put("name",      user.getFirstName());
    args.put("fromEmail", sender.getEmail());
    args.put("fromName",  sender.getFirstName());
    args.put("account" ,  transaction.getInvoiceId());
    args.put("link",      config.getUrl());

    try {
      email.sendEmailFromTemplate(user, message, "invoice-paid", args);
    } catch(Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error sending invoice paid email.", t);
    }

    return transaction;
  }
}
