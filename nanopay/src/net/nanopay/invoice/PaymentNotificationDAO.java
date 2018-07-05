package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.nanos.notification.Notification;
import net.nanopay.invoice.model.*;
import net.nanopay.invoice.notification.ReceivePaymentNotification;
import net.nanopay.invoice.notification.RecordPaymentNotification;

public class PaymentNotificationDAO extends ProxyDAO {

  protected DAO notificationDAO_;
  protected User user;

  public PaymentNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    notificationDAO_ = (DAO) x.get("notificationDAO");
    user = (User) x.get("user");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    Invoice existingInvoice = (Invoice) super.find(invoice.getId());

    if(existingInvoice != null) {

      if ( (invoice.getPaymentMethod() == PaymentStatus.NANOPAY
          || invoice.getPaymentMethod() == PaymentStatus.CHEQUE) 
          && existingInvoice.getPaymentMethod() == PaymentStatus.NONE) {

        long payeeId = (long) invoice.getPayeeId();
        long payerId = (long) invoice.getPayerId();

        System.out.println("user.getId(): " + user.getId());
        System.out.println("user.getFirstName(): " + user.getFirstName());
        System.out.println("user.getLastName(): " + user.getLastName());

        System.out.println("invoice.getCreatedBy(): " + invoice.getCreatedBy());
        System.out.println("payerId: " + payerId);
        System.out.println("payeeId: "+ payeeId);

        if (invoice.getCreatedBy() == payerId) {
          ReceivePaymentNotification notification = new ReceivePaymentNotification();
          notification.setUserId(payeeId);
          notification.setInvoice(invoice);
          notification.setNotificationType("Payment received");
          notificationDAO_.put(notification);
        } else if (invoice.getCreatedBy() == payeeId) {
          RecordPaymentNotification notification = new RecordPaymentNotification();
          notification.setUserId(payerId);
          notification.setInvoice(invoice);
          notification.setNotificationType("Record Payment");
          notificationDAO_.put(notification);
        } else {
          System.out.println("Entered else branch ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
          // throw new RuntimeException("Error in the payment notification.");
        }
      }
    }

    // Put to the DAO
    return super.put_(x, invoice);
  }
}