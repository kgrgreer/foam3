package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.auth.Group;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.util.Emails.EmailsUtility;
import java.util.HashMap;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;

// Sends an email when a Bank Account is Verified
public class AccountVerifiedEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public AccountVerifiedEmailDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("bareUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof BankAccount ) ) {
      return super.put_(x, obj);
    }

    BankAccount account    = (BankAccount) obj;
    if ( ! account.getEnabled() ) {
      return super.put_(x, obj);
    }

    User        owner      = (User) userDAO_.inX(x).find(account.getOwner());
    Group       group      = owner.findGroup(x);
    AppConfig   config     = group != null ? (AppConfig) group.getAppConfig(x) : null;
    BankAccount oldAccount = (BankAccount) find_(x, account.getId());

    // Doesn't send email if the account hasn't been made prior
    if ( oldAccount == null )
      return getDelegate().put_(x, obj);

    // Doesn't send email if the status of the account isn't verified
    if ( ! BankAccountStatus.VERIFIED.equals(account.getStatus()) )
      return getDelegate().put_(x, obj);

    // Doesn't send email if account has been previously verified
    if ( oldAccount.getStatus().equals(account.getStatus()) )
      return getDelegate().put_(x, obj);

    // Doesn't send email if group or group.appConfig was null
    if ( config == null )
      return getDelegate().put_(x, obj);

    account = (BankAccount) super.put_(x, obj);
    EmailMessage            message = new EmailMessage();
    HashMap<String, Object> args    = new HashMap<>();

    message.setTo(new String[]{owner.getEmail()});
    args.put("link",    config.getUrl());
    args.put("name",    owner.getFirstName());
    args.put("account", account.getAccountNumber().substring(account.getAccountNumber().length() - 4));

    try {
      EmailsUtility.sendEmailFromTemplate(x, owner, message, "verifiedBank", args);
    } catch(Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error sending account verified email.", t);
    }
    return account;
  }
}
