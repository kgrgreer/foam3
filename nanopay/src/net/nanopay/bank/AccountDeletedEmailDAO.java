package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.model.Account;
import net.nanopay.model.BankAccount;
import net.nanopay.tx.model.Transaction;
import java.text.NumberFormat;
import java.util.HashMap;

public class AccountDeletedEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public AccountDeletedEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    return getDelegate().put_(x, obj);
  }

  public FObject remove_(X x, FObject obj) {
    try{
      BankAccount account = (BankAccount) obj;
      AppConfig config = (AppConfig) x.get("appConfig");
      User owner = (User) userDAO_.find_(x, account.getOwner());
      EmailService email = (EmailService) x.get("email");
      EmailMessage message = new EmailMessage();
      message.setTo(new String[]{owner.getEmail()});
      HashMap<String, Object> args = new HashMap<>();
      args.put("link", config.getUrl());
      args.put("account", account.getAccountNumber().substring(account.getAccountNumber().length() - 4));
      email.sendEmailFromTemplate(owner, message, "deletedBank", args);

    } catch(Throwable t) {
      t.printStackTrace();
    }
    return getDelegate().remove_(x, obj);
  }
}