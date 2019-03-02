package net.nanopay.cico.paymentCard;

import net.nanopay.cico.paymentCard.model.*;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import foam.core.X;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.AND;

import java.util.List;

public class DuplicatePaymentCard 
  extends ProxyDAO
{
  public DuplicatePaymentCard(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PaymentCard card = (PaymentCard) obj;
    DAO paymentCardDAO = (DAO) x.get("paymentCardDAO");
    ArraySink sink = (ArraySink) paymentCardDAO.where(
      AND (
        EQ(PaymentCard.NUMBER, card.getNumber()),
        EQ(PaymentCard.OWNER, card.getOwner()),
        EQ(PaymentCard.CARDHOLDER_NAME, card.getCardholderName())
      )
    ).select(new ArraySink());
    List list = sink.getArray();
    if ( list.size() == 0 )
      return getDelegate().put_(x, obj);
    else
      throw new RuntimeException("PaymentCard already exists");
  }
}