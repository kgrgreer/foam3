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

public class StripePaymentCardDAO
    extends ProxyDAO
{
  protected static final RequestOptions options_;
  static {
    options_ = RequestOptions.builder().setApiKey("pk_test_sEkkCjZ4jZt2WkJ6iqqyIGLW").build();
  }

  public StripePaymentCardDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    if ( ! (obj instanceof StripePaymentCard) )
      return getDelegate().put_(x, obj);
    
    StripePaymentCard paymentCard = (StripePaymentCard) obj;
    
    // Check if the user is stripe customer.
    User user = (User) x.get("user");
    DAO stripeCustomerDao = (DAO) x.get("stripeCustomerDAO");
    StripeCustomer stripeCustomer = (StripeCustomer) stripeCustomerDao.find_(x, user.getId());

    if ( stripeCustomer == null ) {
      // Call Stripe api to register a customer.
      try {
        Map<String, Object> customerParams = new HashMap<String, Object>();
        Customer customer = Customer.create(customerParams, options_);
        stripeCustomer = new StripeCustomer();
        stripeCustomer.setId(user.getId());
        stripeCustomer.setCustomerId(customer.getId());
        // Save customer reference into journal.
        stripeCustomerDao.put_(x, stripeCustomer);  
      } catch ( APIException|CardException|APIConnectionException|InvalidRequestException|AuthenticationException t ) {
        throw new RuntimeException(t);
      }
    }

    // Retrieve Customer from Stripe.
    Customer customer = null;
    try {
      customer = Customer.retrieve(stripeCustomer.getCustomerId());
    } catch ( APIException|CardException|APIConnectionException|InvalidRequestException|AuthenticationException t ) {
      throw new RuntimeException(t);
    }
    
    if ( customer == null ) 
      throw new RuntimeException("Stripe Customer can not find");
    
    // Save the default card for the customer.
    try {
      Map<String, Object> params = new HashMap<String, Object>();
      params.put("source", paymentCard.getStripeCardToken());
      Card card = (Card) customer.getSources().create(params);
      paymentCard.setStripeCardId(card.getId());
    } catch ( APIException|CardException|APIConnectionException|InvalidRequestException|AuthenticationException t ) {
      throw new RuntimeException(t);
    }

    paymentCard.setNumber(paymentCard.getNumber().substring(paymentCard.getNumber().length() - 4, paymentCard.getNumber().length()));

    return getDelegate().put_(x, paymentCard);
  }
}
