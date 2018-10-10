package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import net.nanopay.auth.PublicUserInfo;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.notification.NewInvoiceNotification;

public class InvoiceNotificationDAO extends ProxyDAO {

  protected DAO userDAO_;
  protected DAO notificationDAO_;
  protected AppConfig config;

  public InvoiceNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
    notificationDAO_ = (DAO) x.get("notificationDAO");
    config = (AppConfig) x.get("appConfig");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());
    boolean payeeIsContact = ((DAO) x.get("contactDAO")).find_(x, invoice.getPayeeId()) != null;

    if ( existingInvoice == null && ! payeeIsContact ) {
      sendInvoiceNotification(invoice);
    }

    return super.put_(x, invoice);
  }

  private void sendInvoiceNotification(Invoice invoice) {
    long payeeId = (long) invoice.getPayeeId();
    long payerId = (long) invoice.getPayerId();

    NewInvoiceNotification notification = new NewInvoiceNotification();

    // Set email values on notification.
    notification = setEmailArgs(invoice, notification);
    notification.setEmailName("newInvoice");
    notification.setEmailIsEnabled(true);

    notification.setUserId(payeeId == ((Long)invoice.getCreatedBy()) ? payerId : payeeId);
    notification.setInvoiceId(invoice.getId());
    notification.setNotificationType("Invoice received");
    notificationDAO_.put(notification);
  }

  private NewInvoiceNotification setEmailArgs(Invoice invoice, NewInvoiceNotification notification) {
    NumberFormat formatter = NumberFormat.getCurrencyInstance();
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");

    PublicUserInfo payee = invoice.getPayee();
    PublicUserInfo payer = invoice.getPayer();

    // If invType is true, then payee sends payer the email and notification.
    boolean invType = (long) invoice.getPayeeId() == (Long)invoice.getCreatedBy();

    notification.getEmailArgs().put("amount", formatter.format(invoice.getAmount()/100.00));
    notification.getEmailArgs().put("account", invoice.getId());
    notification.getEmailArgs().put("name", invType ? payer.getFirstName() : payee.getFirstName());
    notification.getEmailArgs().put("fromEmail", invType ? payee.getEmail() : payer.getEmail());
    notification.getEmailArgs().put("fromName", invType ? payee.label() : payer.label());

    if ( invoice.getDueDate() != null ) {
      notification.getEmailArgs().put("date", dateFormat.format(invoice.getDueDate()));
    }

    notification.getEmailArgs().put("link", config.getUrl());
    return notification;
  }
}
