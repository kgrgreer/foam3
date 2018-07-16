package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.PaymentStatus;
import net.nanopay.invoice.notification.ReceivePaymentNotification;
import net.nanopay.invoice.notification.RecordPaymentNotification;

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
      long payeeId = (long) invoice.getPayeeId();
      long payerId = (long) invoice.getPayerId();

      if ( newStatus == PaymentStatus.NANOPAY ) {
        ReceivePaymentNotification notification =
            new ReceivePaymentNotification();
        notification.setUserId(payeeId);
        notification.setInvoiceId(invoice.getId());
        notification.setNotificationType("Payment received");
        notificationDAO_.put(notification);
      } else if ( newStatus == PaymentStatus.CHEQUE ) {
        RecordPaymentNotification notification =
            new RecordPaymentNotification();
        notification.setUserId(payerId);
        notification.setInvoiceId(invoice.getId());
        notification.setNotificationType("Record payment");
        notificationDAO_.put(notification);
      }
    }

    return super.put_(x, invoice);
  }
}
