package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.app.AppConfig;
import foam.nanos.auth.User;
import foam.nanos.auth.token.TokenService;
import foam.util.SafetyUtil;
import java.text.NumberFormat;
import java.util.*;
import net.nanopay.model.Currency;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.invoice.notification.InvoicePaymentNotification;

/*
 * Invoice decorator responsible for notifying users that their invoice has been
 * paid. Also responsible for notifying external users of paid invoices with a
 * registration token email.
 */
public class PaymentNotificationDAO extends ProxyDAO {
  public DAO notificationDAO_;
  public TokenService externalToken;
  public DAO bareUserDAO_;
  public DAO currencyDAO_;

  public PaymentNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    notificationDAO_ = (DAO) x.get("notificationDAO");
    bareUserDAO_ = (DAO) x.get("bareUserDAO");
    currencyDAO_ = (DAO) x.get("currencyDAO");
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
          newStatus == PaymentStatus.CHEQUE
        )
        &&
        (
          oldStatus == PaymentStatus.NONE ||
          oldStatus == PaymentStatus.PENDING
        );
    boolean invoiceIsGoingThroughHoldingAccountFlow = newStatus == PaymentStatus.DEPOSIT_MONEY && oldStatus == PaymentStatus.DEPOSIT_PAYMENT;
    if ( invoiceIsBeingPaid && ! invoiceIsGoingThroughHoldingAccountFlow ) {
      String invoiceNumber = invoice.getInvoiceNumber();
      String message = "";
      InvoicePaymentNotification notification =
          new InvoicePaymentNotification();
      notification.setInvoice(invoice);
      long payeeId = invoice.getPayeeId();
      long payerId = invoice.getPayerId();

      /*
        If invoice is external and is being paid, calls the external token service and avoids internal
        notifications, otherwise sets email args for internal user email and creates notification.
      */
      if ( invoice.getExternal() ) {

        // Sets up required token parameters.
        long externalUserId = (payeeId == invoice.getCreatedBy()) ? payerId : payeeId;
        User externalUser = (User) bareUserDAO_.find(externalUserId);
        Map tokenParams = new HashMap();
        tokenParams.put("invoice", invoice);

        externalToken.generateTokenWithParameters(x, externalUser, tokenParams);
        return super.put_(x, invoice);
      }

      Currency currency = (Currency) currencyDAO_.inX(x).find(invoice.getDestinationCurrency());

      if ( newStatus == PaymentStatus.NANOPAY ) {
        notification.setUserId(payeeId);
        String senderName = invoice.getPayer().label();
        message = senderName + " just paid your invoice #" +
            invoiceNumber + " of " + currency.format(invoice.getAmount()) + ".";
        notification.setNotificationType("Payment received");
      } else if ( newStatus == PaymentStatus.CHEQUE ) {
        notification.setUserId(payerId);
        String senderName = invoice.getPayee().label();
        message = senderName + " has marked your invoice #" +
            invoiceNumber + " of " + currency.format(invoice.getAmount()) + ".";
        notification.setNotificationType("Record payment");
      }
      notification.setEmailIsEnabled(true);
      notification.setEmailName("invoice-paid");

      AppConfig config    = (AppConfig) x.get("appConfig");
      String accountVar = SafetyUtil
        .isEmpty(invoice.getInvoiceNumber()) ? "N/A" : invoice.getInvoiceNumber();

      String amount = ((Currency) currencyDAO_.find(invoice.getDestinationCurrency()))
        .format(invoice.getAmount());

      HashMap<String, Object> args = new HashMap<>();
      args.put("amount",    amount);
      args.put("currency",  invoice.getDestinationCurrency());
      args.put("name",      invoice.findPayeeId(getX()).getFirstName());
      args.put("link",      config.getUrl());
      args.put("fromEmail", invoice.findPayerId(getX()).getEmail());
      args.put("fromName",  invoice.findPayerId(getX()).getFirstName());
      args.put("account", accountVar);
      notification.setEmailArgs(args);

      notification.setBody(message);
      notificationDAO_.put(notification);
    }

    return super.put_(x, invoice);
  }
}
