package net.nanopay.cico.paymentCard;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import net.nanopay.cico.paymentCard.model.PaymentCard;
import net.nanopay.cico.paymentCard.model.StripePaymentCard;
import foam.nanos.auth.User;
import net.nanopay.tx.stripe.StripeCustomer;
import java.util.*;

import com.stripe.net.RequestOptions;
import com.stripe.model.Customer;
import com.stripe.exception.AuthenticationException;
import com.stripe.exception.InvalidRequestException;
import com.stripe.exception.APIConnectionException;
import com.stripe.exception.CardException;
import com.stripe.exception.APIException;
import com.stripe.model.Card;
import com.stripe.Stripe;

public class StripePaymentCardDAO
    extends ProxyDAO
{
  protected static final RequestOptions options_;
  static {
    //options_ = RequestOptions.builder().setApiKey("pk_test_sEkkCjZ4jZt2WkJ6iqqyIGLW").build();
    options_ = null;
  }

  public StripePaymentCardDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
    Stripe.apiKey = "sk_test_KD0gUbEr1pATM7mTcB3eKNa0";
  }

  @Override
  public FObject put_(X x, FObject obj) {

    if ( ! (obj instanceof StripePaymentCard) )
      return getDelegate().put_(x, obj);
    
    StripePaymentCard paymentCard = (StripePaymentCard) obj;
    User user = (User) x.get("user");

    try {
      Map<String, Object> params = new HashMap<String, Object>();
      params.put("source", paymentCard.getStripeCardToken());
      Customer customer = Customer.create(params);
      paymentCard.setStripeCustomerId(customer.getId());
    } catch ( APIException|CardException|APIConnectionException|InvalidRequestException|AuthenticationException t ) {
      throw new RuntimeException(t);
    }

    paymentCard.setNumber(paymentCard.getNumber().substring(paymentCard.getNumber().length() - 4, paymentCard.getNumber().length()));

    return getDelegate().put_(x, paymentCard);
  }
}
