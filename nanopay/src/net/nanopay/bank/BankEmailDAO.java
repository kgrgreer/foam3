package net.nanopay.bank;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.model.BankAccount;
import java.util.HashMap;

public class BankEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public BankEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");

  }

  @Override
  public FObject put_(X x, FObject obj) {
    try {
      BankAccount account = (BankAccount) obj;
      User user = (User) userDAO_.find_(x, account.getOwner());
      if ( find(account.getId()) != null )
      {
        return getDelegate().put_(x, obj);
      }
      EmailService email = (EmailService) x.get("email");
      EmailMessage message = new EmailMessage();
      message.setTo(new String[]{user.getEmail()});
      HashMap<String, Object> args = new HashMap<>();
      args.put("name", user.getFirstName());
      args.put("account", account.getAccountNumber().substring(account.getAccountNumber().length() - 4));
      email.sendEmailFromTemplate(user, message, "addBank", args);
    } catch(Throwable t) {
      t.printStackTrace();
    }
    return getDelegate().put_(x, obj);

  }
}