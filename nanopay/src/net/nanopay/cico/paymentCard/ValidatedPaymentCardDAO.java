package net.nanopay.cico.paymentCard;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.auth.AuthService;
import foam.nanos.auth.AuthenticationException;
import foam.nanos.auth.AuthorizationException;
import foam.nanos.auth.User;
import net.nanopay.cico.paymentCard.model.PaymentCard;
import net.nanopay.cico.paymentCard.model.PaymentCardType;

public class ValidatedPaymentCardDAO
    extends ProxyDAO
{
  public final static String GLOBAL_PAYMENT_CARD_CREATE = "paymentCard.create.*";
  public final static String GLOBAL_PAYMENT_CARD_READ = "paymentCard.read.*";
  public final static String GLOBAL_PAYMENT_CARD_UPDATE = "paymentCard.update.*";
  public final static String GLOBAL_PAYMENT_CARD_DELETE = "paymentCard.delete.*";

  public ValidatedPaymentCardDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    User user = (User) x.get("user");
    PaymentCard card = (PaymentCard) obj;
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_CREATE) || ! auth.check(x, GLOBAL_PAYMENT_CARD_UPDATE) ) {
      throw new AuthorizationException();
    }

    if ( card.getExpirationDate() != null ) {
      if ( card.isExpired() ) {
        throw new RuntimeException("Card has expired");
      }
    }

    if ( card.getType() == PaymentCardType.CREDIT || card.getType() == PaymentCardType.DEBIT ) {
      /*
      *  To validate the credit card, we use Luhn's algorithm
      *  https://en.wikipedia.org/wiki/Luhn_algorithm
      *
      *  1. Check the checkDigit/hashCode which is the last number on the
      *     card
      *  2. Check if the sum after the algorithm is of mod 10.
      */
      if ( ! this.validateCard(card.getNumber()) ) {
        throw new RuntimeException("Invalid card number");
      }
    }
    return getDelegate().put_(x, obj);
  }

  private int[] convertToInt(String number) {
    /* convert to array of int for simplicity */
    int[] digits = new int[number.length()];
    for (int i = 0; i < number.length(); i++) {
      digits[i] = Character.getNumericValue(number.charAt(i));
    }
    return digits;
  }

  private int[] doubleEveryOtherInt(int[] digits) {
    /* double every other starting from right - jumping from 2 in 2 */
    for (int i = digits.length - 1; i >= 0; i -= 2)	{
      digits[i] += digits[i];

      /* taking the sum of digits grater than 10 - simple trick by substract 9 */
      if (digits[i] >= 10) {
        digits[i] = digits[i] - 9;
      }
    }
    return digits;
  }

  private boolean validateCheckDigit(String number, char checkDigit) {
    if (number == null) { return false; }
    String digit;

    int[] digits = convertToInt(number);

    digits = doubleEveryOtherInt(digits);

    int sum = 0;
    for (int i = 0; i < digits.length; i++) {
      sum += digits[i];
    }
    /* multiply by 9 step */
    sum = sum * 9;

    /* convert to string to be easier to take the last digit */
    digit = sum + "";
    return checkDigit == digit.charAt(digit.length() - 1);
  }

  private boolean validateCard(String card) {
    char checkDigit = card.charAt(card.length() - 1);

    if ( !validateCheckDigit(card.substring(0, card.length() - 1), checkDigit) ) {
      return false;
    }

    int[] digits = convertToInt(card.substring(0, card.length() - 1));
    digits = doubleEveryOtherInt(digits);

    int sum = Character.getNumericValue(checkDigit);
    for (int i = 0; i < digits.length; i++) {
      sum += digits[i];
    }

    return sum % 10 == 0;
  }

  @Override
  public FObject find_(X x, Object id) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_READ) ) {
      throw new AuthorizationException();
    }

    return getDelegate().find_(x, id);
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_READ) ) {
      throw new AuthorizationException();
    }

    return getDelegate().select_(x, sink, skip, limit, order, predicate);
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_DELETE) ) {
      throw new AuthorizationException();
    }

    return getDelegate().remove_(x, obj);
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    User user = (User) x.get("user");
    AuthService auth = (AuthService) x.get("auth");

    if ( user == null ) {
      throw new AuthenticationException();
    }

    if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_DELETE) ) {
      throw new AuthorizationException();
    }

    getDelegate().removeAll_(x, skip, limit, order, predicate);
  }
}
