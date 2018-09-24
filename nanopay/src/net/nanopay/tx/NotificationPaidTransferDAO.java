package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.Notification;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.text.NumberFormat;
import java.util.HashMap;

import net.nanopay.account.Account;
import net.nanopay.tx.TransactionType;
import net.nanopay.tx.model.Transaction;

// Sends an email when an transfer has gone through
public class NotificationPaidTransferDAO
  extends ProxyDAO
{
  protected DAO accountDAO_;
  protected DAO userDAO_;

  public NotificationPaidTransferDAO(X x, DAO delegate) {
    super(x, delegate);
    accountDAO_ = (DAO) x.get("localAccountDAO");
    userDAO_= (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    // Sets the decorator to run on the return phase of the DAO call
    Transaction transaction = (Transaction) super.put_(x, obj);

    // Returns if transaction is an invoice or cico
    if ( transaction.getInvoiceId() != 0 || ! (transaction instanceof DigitalTransaction) )
      return transaction;

    User receiver   = transaction.findDestinationAccount(x).findOwner(x);
    User sender = transaction.findSourceAccount(x).findOwner(x);

    // Returns if transaction is a payment from a CCShopper to a CCMerchant
    if ( "ccShopper".equals(sender.getGroup()) && "ccMerchant".equals(receiver.getGroup()) )
      return transaction;

    // Creates a notification and sends an email when an transfer has gone through
    Notification notification = new Notification();
    notification.setUserId(receiver.getId());
    notification.setBody("You received $" + transaction.getAmount() + " from " + sender.label());
    notification.setNotificationType("Received transfer");
    notification.setEmailIsEnabled(true);
    notification.setEmailName("transfer-paid");

    AppConfig    config    = (AppConfig) x.get("appConfig");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    HashMap<String, Object> args = new HashMap<>();
    // Loads variables that will be represented in the email received
    args.put("amount",    formatter.format(transaction.getAmount()/100.00));
    args.put("name",      receiver.getFirstName());
    args.put("email",     receiver.getEmail());
    args.put("link" ,     config.getUrl());
    args.put("applink" ,  config.getAppLink());
    args.put("playlink" , config.getPlayLink());


    notification.setEmailArgs(args);
    ((DAO)x.get("notificationDAO")).put_(x, notification);

    return transaction;
  }
}
