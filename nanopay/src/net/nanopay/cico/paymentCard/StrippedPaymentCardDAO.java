package net.nanopay.cico.paymentCard;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.cico.paymentCard.model.PaymentCard;

public class StrippedPaymentCardDAO
    extends ProxyDAO
{
  public StrippedPaymentCardDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PaymentCard card = (PaymentCard) obj;

    card.setNumber(card.getNumber().substring(card.getNumber().length() - 4, card.getNumber().length()));

    return getDelegate().put_(x, card);
  }
}
