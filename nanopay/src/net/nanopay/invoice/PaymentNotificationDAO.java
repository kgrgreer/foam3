package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.invoice.notification.InvoicePaymentNotification;

public class PaymentNotificationDAO extends ProxyDAO {

  protected DAO notificationDAO_;

  public PaymentNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    notificationDAO_ = (DAO) x.get("notificationDAO");
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

    if ( invoiceIsBeingPaid ) {
      User user = (User) x.get("user");
      String invoiceNumber = invoice.getInvoiceNumber();
      String message = "";
      InvoicePaymentNotification notification =
          new InvoicePaymentNotification();
      notification.setInvoice(invoice);

      if ( newStatus == PaymentStatus.NANOPAY ) {
        notification.setUserId((long) invoice.getPayeeId());
        String senderName = invoice.getPayer().label();
        message = senderName + " just paid your invoice #" +
            invoiceNumber + " of " + invoice.formatCurrencyAmount() + ".";
        notification.setNotificationType("Payment received");
      } else if ( newStatus == PaymentStatus.CHEQUE ) {
        notification.setUserId((long) invoice.getPayerId());
        String senderName = invoice.getPayee().label();
        message = senderName + " has marked your invoice #" +
            invoiceNumber + " of " + invoice.formatCurrencyAmount() + ".";
        notification.setNotificationType("Record payment");
      }

      notification.setBody(message);
      notificationDAO_.put(notification);
    }

    return super.put_(x, invoice);
  }
}
