package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.Group;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.tx.model.Transaction;
import java.text.NumberFormat;
import java.util.HashMap;

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
    try {
      Transaction transaction = (Transaction) obj;
      if (transaction.getInvoiceId() == 0) {
        return getDelegate().put_(x, obj);
      }
      if ( transaction.getPayeeId() == transaction.getPayerId() ) {
        return getDelegate().put_(x, obj);
      }
      AppConfig config = (AppConfig) x.get("appConfig");
      NumberFormat formatter = NumberFormat.getCurrencyInstance();
      User user = (User) userDAO_.find_(x, transaction.getPayeeId());
      User sender = (User) userDAO_.find_(x, transaction.getPayerId());

      EmailService email = (EmailService) x.get("email");
      EmailMessage message = new EmailMessage();
      message.setTo(new String[]{user.getEmail()});
      HashMap<String, Object> args = new HashMap<>();
      args.put("amount", formatter.format(transaction.getAmount()/100));
      args.put("fromEmail", sender.getEmail());
      args.put("fromName", sender.getFirstName());
      args.put("number" , transaction.getInvoiceId());
      email.sendEmailFromTemplate(user, message, "invoice-paid", args);

    } catch(Throwable t) {
      t.printStackTrace();
    }
    return getDelegate().put_(x, obj);

  }
}