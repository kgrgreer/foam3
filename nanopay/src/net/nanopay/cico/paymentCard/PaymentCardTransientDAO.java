package net.nanopay.cico.paymentCard;

import net.nanopay.cico.paymentCard.model.*;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import foam.core.X;

public class PaymentCardTransientDAO 
  extends ProxyDAO
{
  public PaymentCardTransientDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PaymentCard card = (PaymentCard) obj;
    card.setCvv(null);
    return getDelegate().put_(x, obj);
  }
}