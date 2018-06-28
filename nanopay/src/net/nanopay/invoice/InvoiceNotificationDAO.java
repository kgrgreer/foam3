package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.ui.NewInvoiceNotification;
import foam.nanos.notification.email.EmailService;

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
    sendInvoiceNotification(x, notificationDAO_, invoice);
    // Put to the DAO
    return super.put_(x, invoice);
  }

  public NewInvoiceNotification setEmailArgs(X x, Invoice invoice, NewInvoiceNotification notification) {
    NumberFormat     formatter  = NumberFormat.getCurrencyInstance();
    SimpleDateFormat dateFormat = new SimpleDateFormat("dd-MMM-YYYY");

    User    payee   = (User) userDAO_.find_(x, invoice.getPayeeId());
    User    payer   = (User) userDAO_.find_(x, invoice.getPayerId());

    //sets approriate arguments
    Boolean invoiceType = payeeId == invoice.getCreatedBy();

    notification.getEmailArgs().put("amount",    formatter.format(invoice.getAmount()/100.00));
    notification.getEmailArgs().put("account",   invoice.getId());
    notification.getEmailArgs().put("name",      invoiceType ? payer.getFirstName() : payee.getFirstName());
    notification.getEmailArgs().put("fromEmail", invoiceType ? payee.getEmail() : payer.getEmail());
    notification.getEmailArgs().put("fromName",  invoiceType ? payee.getEmail() : payer.getEmail());

    if ( invoice.getDueDate() != null ) {
      notification.getEmailArgs().put("date",      dateFormat.format(invoice.getDueDate()));

    }
    notification.getEmailArgs().put("link",      config.getUrl());

    return notification;
  }

  private void sendInvoiceNotification(X x, DAO notificationDAO, Invoice invoice) {
    Long sendToUserId;
    Long fromUserId;
    String invoiceType;

    Long payeeId = (Long) invoice.getPayeeId();
    Long payerId = (Long) invoice.getPayerId();

    InvoiceType invoiceType = payeeId == invoice.getCreatedBy() ? InvoiceType.PAYABLE.name() : InvoiceType.RECEIVABLE.name();
    NewInvoiceNotification notification = new NewInvoiceNotification();

    //Set email values on notification
    notification = setEmailArgs(x, invoice, notification);
    notification.setEmailName("newInvoice");
    notification.setEmailIsEnabled(true);

    notification.setUserId(payeeId == invoice.getCreatedBy() ? payerId : payeeId);
    notification.setFromUserId(payeeId != invoice.getCreatedBy() ? payerId : payeeId);
    notification.setNotificationType("Invoice received");
    notification.setInvoiceType(invoiceType);
    notification.setInvoiceId(invoice.getId());
    notification.setAmount(invoice.getAmount());
    notificationDAO.put(notification);
  }
}
