package net.nanopay.cico.paymentCard;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import net.nanopay.cico.paymentCard.model.PaymentCard;
import net.nanopay.cico.paymentCard.model.PaymentCardNetwork;

import java.security.AccessControlException;

import static foam.mlang.MLang.EQ;

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

    card.number = card.number.substring(card.number.length() - 4, card.number.length());

    return getDelegate().put_(x, card);
  }
}
