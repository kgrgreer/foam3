package net.nanopay.tx;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;
import net.nanopay.tx.model.Transaction;
import java.text.NumberFormat;
import java.util.HashMap;

public class PaidEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public PaidEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    /*try {
      Transaction transaction = (Transaction) obj;
      AppConfig config = (AppConfig) x.get("appConfig");
      NumberFormat formatter = NumberFormat.getCurrencyInstance();
      User user = (User) userDAO_.find_(x, transaction.getPayeeId());
      User sender = (User) userDAO_.find_(x, transaction.getPayerId());
      if ( transaction.getPayeeId() == transaction.getPayerId() )
      {
        return getDelegate().put_(x, obj);
      }
      EmailService email = (EmailService) x.get("email");
      EmailMessage message = new EmailMessage();
      message.setTo(new String[]{user.getEmail()});
      HashMap<String, Object> args = new HashMap<>();
      args.put("amount", formatter.format(transaction.getAmount()/100));
      //Arguments for transfer Paid template
      args.put("name", user.getFirstName());
      args.put("email", user.getEmail());
      args.put("link" , config.getUrl());
      args.put("applink" , config.getAppLink());
      args.put("playlink" , config.getPlayLink());

      //Arguments for invoice Paid template
      args.put("fromEmail", sender.getEmail());
      args.put("fromName", sender.getEmail());
      args.put("number" , transaction.getInvoiceId());


      String template = (transaction.getInvoiceId() == 0) ? "transfer-paid" : "invoice-paid";
      System.out.println(template);
      email.sendEmailFromTemplate(user, message, template, args);
    } catch(Throwable t) {
      t.printStackTrace();
    }*/
    return getDelegate().put_(x, obj);

  }
}