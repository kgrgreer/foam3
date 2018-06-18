package net.nanopay.cico.paymentCard;

import net.nanopay.cico.paymentCard.model.*;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import foam.core.X;

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
    String cicoDriverId = card.getCicoDriver();
    if ( cicoDriverId == null ) {
      throw new RuntimeException("Do not choose payment card platform");
    }
    return getDelegate().put_(x, obj);
  }
}
