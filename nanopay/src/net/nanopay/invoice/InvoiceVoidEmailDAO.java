package net.nanopay.invoice;

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
import net.nanopay.invoice.model.Invoice;


//Sends an email to the payer of the Invoice to inform them that the invoice has been Voided
public class InvoiceVoidEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public InvoiceVoidEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;

    //Checks to make sure invoice is set to Void
    if (! invoice.getPaymentMethod().name().equals("VOID")){
      return getDelegate().put_(x, obj);
    }
    invoice = (Invoice) super.put_(x , obj);
    AppConfig config = (AppConfig) x.get("appConfig");
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    User payer = (User) userDAO_.find_(x, invoice.getPayerId());
    EmailService email = (EmailService) x.get("email");
    EmailMessage message = new EmailMessage();
    message.setTo(new String[]{payer.getEmail()});
    HashMap<String, Object> args = new HashMap<>();
    args.put("account", invoice.getId());
    args.put("amount", formatter.format(invoice.getAmount()));
    args.put("link", config.getUrl());
    try{
      email.sendEmailFromTemplate(payer, message, "voidInvoice", args);
    } catch(Throwable t) {
      t.printStackTrace();
    }
    return invoice;
  }
}