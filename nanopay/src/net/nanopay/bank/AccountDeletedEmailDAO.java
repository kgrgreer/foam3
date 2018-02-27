package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import java.util.HashMap;
import net.nanopay.model.BankAccount;

// Send an email when a bank account is deleted
public class AccountDeletedEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public AccountDeletedEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    BankAccount  account = (BankAccount) super.remove_(x, obj);
    AppConfig    config  = (AppConfig) x.get("appConfig");
    User         owner   = (User) userDAO_.find_(x, account.getOwner());
    EmailService email   = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();

    message.setTo(new String[]{owner.getEmail()});
    HashMap<String, Object> args = new HashMap<>();
    args.put("link",    config.getUrl());
    args.put("name",    owner.getFirstName());
    args.put("account", account.getAccountNumber().substring(account.getAccountNumber().length() - 4));

    try{
      email.sendEmailFromTemplate(owner, message, "deletedBank", args);
    } catch(Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error sending account verified email.", t);
    }
    return account;
  }
}
