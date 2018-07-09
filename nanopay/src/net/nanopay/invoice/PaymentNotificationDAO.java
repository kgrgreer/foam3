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

    if(existingInvoice != null) {
      // check if the invoice payment status is changed from NONE to NANOPAY/CHEQUE (Paid)
      if ((invoice.getPaymentMethod() == PaymentStatus.NANOPAY
          || invoice.getPaymentMethod() == PaymentStatus.CHEQUE)
          && existingInvoice.getPaymentMethod() == PaymentStatus.NONE) {

        User user = (User) x.get("user");
        long payeeId = (long) invoice.getPayeeId();
        long payerId = (long) invoice.getPayerId();

        if (user.getId() == payerId) {
          ReceivePaymentNotification notification = new ReceivePaymentNotification();
          notification.setUserId(payeeId);
          notification.setInvoice(invoice);
          notification.setNotificationType("Payment received");
          notificationDAO_.put(notification);
        } else if (user.getId() == payeeId) {
          RecordPaymentNotification notification = new RecordPaymentNotification();
          notification.setUserId(payerId);
          notification.setInvoice(invoice);
          notification.setNotificationType("Record payment");
          notificationDAO_.put(notification);
        } else {
          throw new RuntimeException("Error in the payment notification.");
        }
      }
    }

    // Put to the DAO
    return super.put_(x, invoice);
  }
}