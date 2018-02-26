package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.notification.email.EmailMessage;
import foam.nanos.notification.email.EmailService;

import java.text.SimpleDateFormat;
import java.util.HashMap;
import net.nanopay.invoice.model.Invoice;
import java.text.NumberFormat;


// Sends an email when an invoice is made.
public class InvoiceMakeEmailDAO
  extends ProxyDAO
{
  protected DAO userDAO_;

  public InvoiceMakeEmailDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    User    payee   = (User) userDAO_.find_(x, invoice.getPayeeId());
    User    payer   = (User) userDAO_.find_(x, invoice.getPayerId());

    // Makes sure an email isn't sent if the creator is the payer of the invoice
    if ( payer.getId() == invoice.getCreatedBy() )
      return getDelegate().put_(x, obj);

    // Doesn't send invoice if one with the same id already exists
    if ( find(invoice.getId()) != null )
      return getDelegate().put_(x, obj);

    // Sends email after the invoice was put to the DAO
    invoice = (Invoice) super.put_(x,obj);
    AppConfig        config     = (AppConfig) x.get("appConfig");
    EmailService     email      = (EmailService) x.get("email");
    EmailMessage     message    = new EmailMessage();
    NumberFormat     formatter  = NumberFormat.getCurrencyInstance();
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");

    message.setTo(new String[]{payer.getEmail()});
    HashMap<String, Object> args = new HashMap<>();
    args.put("amount",    formatter.format(invoice.getAmount()/100.00));
    args.put("fromEmail", payee.getEmail());
    args.put("fromName",  payee.getFirstName());
    args.put("date",      dateFormat.format(invoice.getDueDate()));
    args.put("link",      config.getUrl());

    try {
      email.sendEmailFromTemplate(payer, message, "newInvoice", args);
    } catch(Throwable t) {
      ((Logger) x.get(Logger.class)).error("Error sending invoice created email.", t);
    }
    return invoice;
  }
}