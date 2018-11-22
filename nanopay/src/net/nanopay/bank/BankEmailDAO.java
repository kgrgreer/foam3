package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import foam.util.Auth;
import java.util.HashMap;
import net.nanopay.bank.BankAccount;

// Sends an email when a Bank account is created
public class BankEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public BankEmailDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof BankAccount ) ) {
      return super.put_(x, obj);
    }
    
    AuthService auth = (AuthService) x.get("auth");
    BankAccount account = (BankAccount) obj;
    User        user    = (User) userDAO_.find_(x, account.getOwner());

    // Don't send an email if the account already exists or if account is for Ablii
    if ( find(account.getId()) != null && auth.check(x, "invoice.holdingAccount"))
      return getDelegate().put_(x, obj);

    account = (BankAccount) super.put_(x, obj);
    EmailService email   = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    AppConfig    config  = (AppConfig) x.get("appConfig");
    try {
      message.setTo(new String[]{user.getEmail()});
      HashMap<String, Object> args = new HashMap<>();
      args.put("name",    user.getFirstName());
      args.put("account", account.getAccountNumber().substring(account.getAccountNumber().length() - 4));
      args.put("link",    config.getUrl());
      email.sendEmailFromTemplate(x, user, message, "addBank", args);
    } catch(Throwable t) {
      Logger logger = (Logger) getX().get("logger");
      logger.error("Error sending bank account created email.", t);
    }
    return account;
  }
}
