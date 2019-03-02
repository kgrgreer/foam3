package net.nanopay.cico.paymentCard;

import net.nanopay.cico.paymentCard.model.*;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import foam.core.X;
import net.nanopay.cico.paymentCard.model.StripePaymentCard;
import net.nanopay.cico.paymentCard.model.RealexPaymentCard;

public class PaymentCardSanitizeDAO 
  extends ProxyDAO
{
  public PaymentCardSanitizeDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PaymentCard card = (PaymentCard) obj;
    String txnProcessorId = card.getTxnProcessor();
    if ( obj instanceof StripePaymentCard ||
          obj instanceof RealexPaymentCard
        ) {
      return getDelegate().put_(x, obj);
    } else {
      throw new RuntimeException("Do not choose payment card platform");
    }
  }
}
