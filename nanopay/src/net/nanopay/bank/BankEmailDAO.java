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
import foam.util.Emails.EmailsUtility;
import foam.util.Auth;
import java.util.HashMap;

import net.nanopay.contacts.Contact;
import net.nanopay.account.Account;
import net.nanopay.bank.BankAccount;
import net.nanopay.model.Business;

// Sends an email when a Bank account is created
public class BankEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public BankEmailDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    userDAO_ = (DAO) x.get("bareUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if (
      ! ( obj instanceof BankAccount ) ||
      super.find_(x, ((Account) obj).getId()) != null
    ) {
      return super.put_(x, obj);
    }

    BankAccount account = (BankAccount) obj;
    User user = (User) userDAO_.inX(x).find(account.getOwner());
    Logger logger = (Logger) x.get("logger");

    if ( user == null ) {
      throw new IllegalStateException("Please select an account owner.");
    }

    if ( user instanceof Contact ) {
      return super.put_(x, obj);
    }

    String emailAddress;
    String firstName;
    String organization;
    if ( user instanceof Business ) {
      User agent = (User) x.get("agent");
      if ( agent != null ) {
        emailAddress = agent.getEmail();
        firstName = agent.getFirstName();
      } else {
        // It would be unexpected for this to happen, but it's not necessarily
        // an error. We'll return because we don't have an email address to send
        // the email to.
        logger.debug("UNEXPECTED: A business added a bank account but the agent wasn't set in the context.");
        return super.put_(x, obj);
      }
    } else {
      emailAddress = user.getEmail();
      firstName = user.getFirstName();
    }

    organization = user.getOrganization();
    account = (BankAccount) super.put_(x, obj);
    EmailMessage message = new EmailMessage();
    AppConfig    config  = (AppConfig) x.get("appConfig");
    message.setTo(new String[]{emailAddress});
    HashMap<String, Object> args = new HashMap<>();
    String accNumber = account.getAccountNumber() != null ? account.getAccountNumber().substring(account.getAccountNumber().length() - 4) : "";
    try {
      args.put("name",    firstName);
      args.put("account", accNumber);
      args.put("link",    config.getUrl());
      args.put("business", organization);
      EmailsUtility.sendEmailFromTemplate(x, user, message, "addBank", args);
    } catch(Throwable t) {
      logger.error("Error sending bank account created email.", t);
    }
    return account;
  }
}
