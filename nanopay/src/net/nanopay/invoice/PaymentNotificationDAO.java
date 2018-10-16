package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.auth.token.TokenService;

import java.text.NumberFormat;
import java.util.*;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.invoice.notification.InvoicePaymentNotification;

/*
  Documentation:
    Invoice Decorator responsible for notifying users that their invoice has been paid.
    Also responsible for notifying external users of paid invoices with a registration token email.
*/

public class PaymentNotificationDAO extends ProxyDAO {

  protected DAO notificationDAO_;
  protected TokenService externalToken;
  protected DAO bareUserDAO_;

  public PaymentNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    notificationDAO_ = (DAO) x.get("notificationDAO");
    bareUserDAO_ = (DAO) x.get("bareUserDAO");
    externalToken = (TokenService) x.get("externalInvoiceToken");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());

    if ( existingInvoice == null ) {
      return super.put_(x, obj);
    }

    PaymentStatus newStatus = invoice.getPaymentMethod();
    PaymentStatus oldStatus = existingInvoice.getPaymentMethod();
    boolean invoiceIsBeingPaid =
        (
          newStatus == PaymentStatus.NANOPAY ||
          newStatus == PaymentStatus.CHEQUE ||
          newStatus == PaymentStatus.HOLDING
        )
        &&
        (
          oldStatus == PaymentStatus.NONE ||
          oldStatus == PaymentStatus.PENDING
        );

    if ( invoiceIsBeingPaid ) {
      User user = (User) x.get("user");
      String invoiceNumber = invoice.getInvoiceNumber();
      String message = "";
      InvoicePaymentNotification notification =
          new InvoicePaymentNotification();
      notification.setInvoice(invoice);
      long payeeId = (long) invoice.getPayeeId();
      long payerId = (long) invoice.getPayerId();

      /*
        If invoice is external and is being paid, calls the external token service and avoids internal
        notifications, otherwise sets email args for internal user email and creates notification.
      */
      if ( invoice.getExternal() ) {

        // Sets up required token parameters.
        long externalUserId = (payeeId == ((Long)invoice.getCreatedBy())) ? payerId : payeeId;
        User externalUser = (User) bareUserDAO_.find(externalUserId);
        Map tokenParams = new HashMap();
        tokenParams.put("invoice", invoice);

        externalToken.generateTokenWithParameters(x, externalUser, tokenParams);
        return super.put_(x, invoice);
      }

      if ( newStatus == PaymentStatus.NANOPAY ) {
        notification.setUserId(payeeId);
        String senderName = invoice.getPayer().label();
        message = senderName + " just paid your invoice #" +
            invoiceNumber + " of " + invoice.formatCurrencyAmount() + ".";
        notification.setNotificationType("Payment received");
      } else if ( newStatus == PaymentStatus.CHEQUE ) {
        notification.setUserId(payerId);
        String senderName = invoice.getPayee().label();
        message = senderName + " has marked your invoice #" +
            invoiceNumber + " of " + invoice.formatCurrencyAmount() + ".";
        notification.setNotificationType("Record payment");
      }
      notification.setEmailIsEnabled(true);
      AppConfig config    = (AppConfig) x.get("appConfig");
      NumberFormat formatter = NumberFormat.getCurrencyInstance();

      HashMap<String, Object> args = new HashMap<>();
      args.put("amount",    formatter.format(invoice.getAmount()/100.00));
      args.put("name",      invoice.findPayeeId(getX()).getFirstName());
      args.put("link",      config.getUrl());
      notification.setEmailName("invoice-paid");
      args.put("fromEmail", invoice.findPayerId(getX()).getEmail());
      args.put("fromName",  invoice.findPayerId(getX()).getFirstName());
      args.put("account" ,  invoice.getId());
      notification.setEmailArgs(args);

      notification.setBody(message);
      notificationDAO_.put(notification);
    }

    return super.put_(x, invoice);
  }
}
