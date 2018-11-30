package net.nanopay.cico.paymentCard;

import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import java.util.Map;
import foam.dao.ProxyDAO;
import java.util.UUID;
import net.nanopay.cico.paymentCard.model.PaymentCard;
import net.nanopay.cico.paymentCard.model.PaymentCardType;
import net.nanopay.cico.paymentCard.model.PaymentCardNetwork;
import com.realexpayments.remote.sdk.domain.Card;
import com.realexpayments.remote.sdk.domain.Cvn.PresenceIndicator;
import com.realexpayments.remote.sdk.domain.Card.CardType;
import com.realexpayments.remote.sdk.domain.payment.PaymentRequest.PaymentType;
import com.realexpayments.remote.sdk.domain.payment.PaymentRequest;
import com.realexpayments.remote.sdk.http.HttpConfiguration;
import com.realexpayments.remote.sdk.RealexClient;
import com.realexpayments.remote.sdk.RealexException;
import com.realexpayments.remote.sdk.RealexServerException;
import com.realexpayments.remote.sdk.domain.payment.PaymentResponse;

public class RealexVerificationPaymentCardDAO
  extends ProxyDAO
{
  public RealexVerificationPaymentCardDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    PaymentCard card = (PaymentCard) obj;
    if ( ! net.nanopay.tx.TxnProcessor.REALEX.equals(card.getTxnProcessor()) ) {
      return getDelegate().put_(x, obj);
    }
    Card c = new Card();
    c.addNumber(card.getNumber())
      .addExpiryDate(card.getExpiryMonth() + card.getExpiryYear())
      .addCvn(card.getCvv())
      .addCvnPresenceIndicator(PresenceIndicator.CVN_PRESENT);
    c.addCardHolderName(card.getCardholderName());
    if ( card.getNetwork() == PaymentCardNetwork.VISA ) {
      c.addType(CardType.VISA);
    } else if ( card.getNetwork() == PaymentCardNetwork.MASTERCARD ) {
      c.addType(CardType.MASTERCARD);
    } else if ( card.getNetwork() == PaymentCardNetwork.AMERICANEXPRESS ) {
      c.addType(CardType.AMEX);
    } else if ( card.getNetwork() == PaymentCardNetwork.DISCOVER ) {
      //miss discover cardType in SDK
    }
    Map externalParameters = card.getExternalParameters();

    PaymentRequest paymentRequest = new PaymentRequest()
      .addType(PaymentType.OTB)
      .addOrderId(UUID.randomUUID().toString())
      //need to store merchantId into externalParameters
      .addMerchantId(externalParameters.get("merchantid").toString())
      .addCard(c);
    HttpConfiguration HttpConfiguration = new HttpConfiguration();
    HttpConfiguration.setEndpoint("https://api.sandbox.realexpayments.com/epage-remote.cgi");
    //TODO: do not hard code secret
    RealexClient client = new RealexClient("secret", HttpConfiguration);
    try {
      PaymentResponse response = client.send(paymentRequest);
      if ( ! "00".equals(response.getResult()) ) 
        throw new RuntimeException("fail to verify by Realex, error message: " + response.getMessage());
      return getDelegate().put_(x, obj);
    } catch ( RealexServerException e ) {
      throw new RuntimeException("Can not use Realex otb to verify card");
    } catch ( RealexException e ) {
      throw new RuntimeException("Can not use Realex otb to verify card");
    }
  }
}
