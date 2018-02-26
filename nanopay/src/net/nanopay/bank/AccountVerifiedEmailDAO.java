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

// Sends an email when a Bank Account is Verified
public class AccountVerifiedEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public AccountVerifiedEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    BankAccount account    = (BankAccount) obj;
    User        owner      = (User) userDAO_.find_(x, account.getOwner());
    AppConfig   config     = (AppConfig) x.get("appConfig");
    BankAccount oldAccount = (BankAccount) find_(x, account.getId());

    // Doesn't send email if the account hasn't been made prior
    if ( oldAccount.equals(null) )
      return getDelegate().put_(x, obj);

    // Doesn't send email if the status of the account isn't verified
    if ( ! account.getStatus().equals("Verified") )
      return getDelegate().put_(x, obj);

    // Doesn't send email if account has been previously verified
    if ( oldAccount.getStatus().equals(account.getStatus()) )
      return getDelegate().put_(x, obj);

    account = (BankAccount) super.put_(x , obj);
    EmailService           email = (EmailService) x.get("email");
    EmailMessage         message = new EmailMessage();
    HashMap<String, Object> args = new HashMap<>();

    message.setTo(new String[]{owner.getEmail()});
    args.put("link",    config.getUrl());
    args.put("account", account.getAccountNumber().substring(account.getAccountNumber().length() - 4));

    try {
      email.sendEmailFromTemplate(owner, message, "verifiedBank", args);
    } catch(Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error sending account verified email.", t);
    }

    return account;
  }
}
