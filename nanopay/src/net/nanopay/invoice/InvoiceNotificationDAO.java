package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import net.nanopay.auth.PublicUserInfo;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.notification.NewInvoiceNotification;

public class InvoiceNotificationDAO extends ProxyDAO {

  protected DAO userDAO_;
  protected DAO notificationDAO_;
  protected AppConfig config;

  enum InvoiceType {
    RECEIVABLE, PAYABLE;
  }

  public InvoiceNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    userDAO_ = (DAO) x.get("localUserDAO");
    notificationDAO_ = (DAO) x.get("notificationDAO");
    config     = (AppConfig) x.get("appConfig");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());

    if ( existingInvoice == null ) {
      sendInvoiceNotification(x, invoice);
    }
    // Put to the DAO
    return super.put_(x, invoice);
  }

  private NewInvoiceNotification setEmailArgs(X x, Invoice invoice, NewInvoiceNotification notification) {
    NumberFormat     formatter  = NumberFormat.getCurrencyInstance();
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");

//    Invoice invoiceAb = (Invoice) super.put_(x, invoice);
    PublicUserInfo    payee   =  invoice.getPayee();
    PublicUserInfo    payer   =  invoice.getPayer();
    
    //sets approriate arguments
    boolean invType = (long) invoice.getPayeeId() == invoice.getCreatedBy();

    notification.getEmailArgs().put("amount",    formatter.format(invoice.getAmount()/100.00));
    notification.getEmailArgs().put("account",   invoice.getId());
    notification.getEmailArgs().put("name",      invType ? payer.getFirstName() : payee.getFirstName());
    notification.getEmailArgs().put("fromEmail", invType ? payee.getEmail() : payer.getEmail());
    notification.getEmailArgs().put("fromName",  invType ? payee.label() : payer.label());

    if ( invoice.getDueDate() != null ) {
      notification.getEmailArgs().put("date",      dateFormat.format(invoice.getDueDate()));
    }

    notification.getEmailArgs().put("link",      config.getUrl());
    return notification;
  }

  private void sendInvoiceNotification(X x, Invoice invoice) {
    long payeeId = (long) invoice.getPayeeId();
    long payerId = (long) invoice.getPayerId();

    String invType = payeeId == invoice.getCreatedBy() ? InvoiceType.PAYABLE.name() : InvoiceType.RECEIVABLE.name();
    NewInvoiceNotification notification = new NewInvoiceNotification();

    //Set email values on notification
    notification = setEmailArgs(x, invoice, notification);
    notification.setEmailName("newInvoice");
    notification.setEmailIsEnabled(true);

    notification.setUserId(payeeId == invoice.getCreatedBy() ? payerId : payeeId);
    notification.setFromUserId(payeeId != invoice.getCreatedBy() ? payerId : payeeId);
    notification.setNotificationType("Invoice received");
    notification.setInvoiceType(invType);
    notification.setInvoiceId(invoice.getId());
    notification.setAmount(invoice.getAmount());
    notificationDAO_.put(notification);
  }
}
