package net.nanopay.invoice;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import net.nanopay.invoice.model.*;
import net.nanopay.invoice.notification.ReceivePaymentNotification;

public class PaymentNotificationDAO extends ProxyDAO {

  protected DAO notificationDAO_;

  public PaymentNotificationDAO(X x, DAO delegate) {
    super(x, delegate);
    notificationDAO_ = (DAO) x.get("notificationDAO");
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Invoice invoice = (Invoice) obj;
    long payeeId = (long) invoice.getPayeeId();
    long payerId = (long) invoice.getPayerId();

    if ( PaymentStatus.NANOPAY == invoice.getPaymentMethod()
        || PaymentStatus.CHEQUE == invoice.getPaymentMethod()) {
      ReceivePaymentNotification notification = new ReceivePaymentNotification();
      notification.setUserId(payeeId);
      notification.setFromUserId(payerId);
      notification.setNotificationType("Payment received");
      notification.setInvoiceNumber(invoice.getInvoiceNumber());
      notification.setInvoiceId(invoice.getId());
      notification.setAmount(invoice.getAmount());
      notificationDAO_.put(notification);
    }

    // Put to the DAO
    return super.put_(x, invoice);
  }
}