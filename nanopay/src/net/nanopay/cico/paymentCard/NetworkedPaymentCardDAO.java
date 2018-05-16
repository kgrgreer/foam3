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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

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
      } else if ( isDinersClub(card.getNumber()) ) {
        card.setNetwork(PaymentCardNetwork.DINERSCLUB);
      } else if ( isJCB(card.getNumber()) ) {
        card.setNetwork(PaymentCardNetwork.JCB);
      }
    }

    return getDelegate().put_(x, obj);
  }

  private boolean isVisa(String number) {
    Pattern regex = Pattern.compile("^4[0-9]{12}(?:[0-9]{3})?$");
    return regex.matcher(number).matches();
  }

  private boolean isMasterCard(String number) {
    Pattern regex = Pattern.compile("^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$");
    return regex.matcher(number).matches();
  }

  private boolean isDiscover(String number) {
    Pattern regex = Pattern.compile("^6(?:011|5[0-9]{2})[0-9]{12}$");
    return regex.matcher(number).matches();
  }

  private boolean isAmex(String number) {
    Pattern regex = Pattern.compile("^3[47][0-9]{13}$");
    return regex.matcher(number).matches();
  }

  private boolean isDinersClub(String number) {
    Pattern regex = Pattern.compile("^3(?:0[0-5]|[68][0-9])[0-9]{11}");
    return regex.matcher(number).matches();
  }

  private boolean isJCB(String number) {
    Pattern regex = Pattern.compile("^(?:2131|1800|35\\d{3})\\d{11}$");
    return regex.matcher(number).matches();
  }
}
