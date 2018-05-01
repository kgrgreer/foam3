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
import net.nanopay.cico.paymentCard.model.PaymentCardType;
import net.nanopay.cico.paymentCard.model.PaymentCardNetwork;

import java.security.AccessControlException;

import static foam.mlang.MLang.EQ;

public class NetworkedPaymentCardDAO
    extends ProxyDAO
{
  public NetworkedPaymentCardDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PaymentCard card = (PaymentCard) obj;

    if ( card.getType() == PaymentCardType.CREDIT || card.getType() == PaymentCardType.DEBIT ) {
      if ( isVisa(card.getNumber()) ) {
        card.setNetwork(PaymentCardNetwork.VISA);
      } else if ( isMasterCard(card.getNumber()) ) {
        card.setNetwork(PaymentCardNetwork.MASTERCARD);
      } else if ( isDiscover(card.getNumber()) ) {
        card.setNetwork(PaymentCardNetwork.DISCOVER);
      } else if ( isAmex(card.getNumber()) ) {
        card.setNetwork(PaymentCardNetwork.AMERICANEXPRESS);
      }
    }

    return getDelegate().put_(x, obj);
  }

  private boolean isVisa(String number) {
    if ( number.startsWith("4") ) { return true; }
    return false;
  }

  private boolean isMasterCard(String number) {
    if ( number.startsWith("51") ||
         number.startsWith("52") ||
         number.startsWith("53") ||
         number.startsWith("54") ||
         number.startsWith("55") ) {
      return true;
    }
    return false;
  }

  private boolean isDiscover(String number) {
    if ( number.startsWith("6011") ||
         number.startsWith("644") ||
         number.startsWith("65") ) {
      return true;
    }
    return false;
  }

  private boolean isAmex(String number) {
    if ( number.startsWith("34") ||
         number.startsWith("37") ) {
      return true;
    }
    return false;
  }
}
