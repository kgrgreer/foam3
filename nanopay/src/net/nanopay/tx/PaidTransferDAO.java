package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.text.NumberFormat;
import java.util.HashMap;
import net.nanopay.tx.model.Transaction;

public class PaidTransferDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public PaidTransferDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    //Sets the decorator to run on the return phase of the DAO call
    Transaction transaction = (Transaction) super.put_(x, obj);


    //Returns if transaction is an invoice
    if (transaction.getInvoiceId() != 0) {
      return transaction;
    }

    //Returns if transaction is a cico transaction
    if ( transaction.getPayeeId() == transaction.getPayerId() ) {
      return transaction;
    }

    User user = (User) userDAO_.find_(x, transaction.getPayeeId());
    User sender = (User) userDAO_.find_(x, transaction.getPayerId());

    //Returns if transaction is a payment from a CCShopper to a CCMerchant
    if (sender.getGroup().equals("ccShopper") && user.getGroup().equals("ccMerchant")) {
      return transaction;
    }

    //Sends an email when an transfer has gone through
    AppConfig config = (AppConfig) x.get("appConfig");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();

    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    message.setTo(new String[]{user.getEmail()});
    HashMap<String, Object> args = new HashMap<>();

    //loads variables that will be represented in the email received
    args.put("amount", formatter.format(transaction.getAmount()/100));
    args.put("name", user.getFirstName());
    args.put("email", user.getEmail());
    args.put("link" , config.getUrl());
    args.put("applink" , config.getAppLink());
    args.put("playlink" , config.getPlayLink());
    try {
      email.sendEmailFromTemplate(user, message, "transfer-paid", args);
    } catch(Throwable t) {
      t.printStackTrace();
    }
    return transaction;
  }
}