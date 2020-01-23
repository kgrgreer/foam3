package net.nanopay.cico.paymentCard;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;

import java.util.List;
import java.util.UUID;

import com.realexpayments.remote.sdk.RealexClient;
import com.realexpayments.remote.sdk.RealexException;
import com.realexpayments.remote.sdk.RealexServerException;
import com.realexpayments.remote.sdk.domain.Card;
import com.realexpayments.remote.sdk.domain.Card.CardType;
import com.realexpayments.remote.sdk.domain.Payer;
import com.realexpayments.remote.sdk.domain.payment.PaymentRequest;
import com.realexpayments.remote.sdk.domain.payment.PaymentRequest.PaymentType;
import com.realexpayments.remote.sdk.domain.payment.PaymentResponse;
import com.realexpayments.remote.sdk.http.HttpConfiguration;

import foam.core.FObject;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.cico.paymentCard.model.PaymentCardNetwork;
import net.nanopay.cico.paymentCard.model.RealexPaymentCard;
import net.nanopay.tx.TxnProcessorUserReference;

public class RealexPaymentCardStoreDAO
  extends ProxyDAO
{
  public RealexPaymentCardStoreDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {

    if ( ! (obj instanceof RealexPaymentCard) )
      return getDelegate().put_(x, obj);

    RealexPaymentCard card = (RealexPaymentCard) obj;
    User user = (User)x.get("user");
    DAO txnProcessorUserReferenceDAO = (DAO) x.get("txnProcessorUserReferenceDAO");
    ArraySink sink = (ArraySink) txnProcessorUserReferenceDAO.where(
      AND(
        EQ(TxnProcessorUserReference.USER_ID, (long) user.getId()),
        EQ(TxnProcessorUserReference.PROCESSOR_ID, card.getTxnProcessor())
      )).select(new ArraySink());
    List list = sink.getArray();
    TxnProcessorUserReference processorReference = null;
    if ( list.size() == 0 )
      processorReference = new TxnProcessorUserReference();
    else
      processorReference = (TxnProcessorUserReference) list.get(0);

    processorReference = (TxnProcessorUserReference) processorReference.fclone();
    String reference = processorReference.getReference();
    if ( reference == null || SafetyUtil.isEmpty(reference) ) {
      //create payer reference in Realex if do not exist
      reference = UUID.randomUUID().toString();
      Payer myPayer = new Payer()
        .addRef(reference)
        .addType("Retail");
      PaymentRequest request = new PaymentRequest()
        .addType(PaymentType.PAYER_NEW)
        .addMerchantId(card.getExternalParameters().get("merchantId").toString())
        .addPayer(myPayer);
      try {
        PaymentResponse response = call(request);
        if ( ! "00".equals(response.getResult()) ) {
          throw new RuntimeException("fail to create Payer by Realex, error message: " + response.getMessage());
        }
        processorReference.setReference(reference);
        processorReference.setUserId(user.getId());
        processorReference.setProcessorId(net.nanopay.tx.TxnProcessor.REALEX);
        txnProcessorUserReferenceDAO.put(processorReference);
      } catch ( Throwable e ) {
        throw new RuntimeException(e);
      }
    }
    String cardReference = UUID.randomUUID().toString();
    Card myCard = new Card()
      .addNumber(card.getNumber())
      .addExpiryDate(card.getExpiryMonth() + card.getExpiryYear())
      .addCardHolderName(card.getCardholderName())
      .addReference(cardReference)
      .addPayerReference(reference);
    if ( card.getNetwork() == PaymentCardNetwork.VISA ) {
      myCard.addType(CardType.VISA);
    } else if ( card.getNetwork() == PaymentCardNetwork.MASTERCARD ) {
      myCard.addType(CardType.MASTERCARD);
    } else if ( card.getNetwork() == PaymentCardNetwork.AMERICANEXPRESS ) {
      myCard.addType(CardType.AMEX);
    } else if ( card.getNetwork() == PaymentCardNetwork.DISCOVER ) {
      throw new RuntimeException("Do not support DISCOVER");
    } else {
      throw new RuntimeException("Card Type do not support");
    }
    PaymentRequest request = new PaymentRequest()
      .addType(PaymentType.CARD_NEW)
      .addMerchantId(card.getExternalParameters().get("merchantId").toString())
      .addCard(myCard);
    try {
      PaymentResponse response = call(request);
      if ( ! "00".equals(response.getResult()) ) {
        throw new RuntimeException("fail to store Card by Realex, error message: " + response.getMessage());
      }
      card.setRealexCardReference(cardReference);
    } catch ( Throwable e ) {
      throw new RuntimeException(e);
    }
    return getDelegate().put_(x, card);
  }

  protected PaymentResponse call(PaymentRequest request) throws RealexServerException, RealexException {
    HttpConfiguration HttpConfiguration = new HttpConfiguration();
    HttpConfiguration.setEndpoint("https://api.sandbox.realexpayments.com/epage-remote.cgi");
    //TODO: do not hard code secret
    RealexClient client = new RealexClient("secret", HttpConfiguration);
    return client.send(request);
  }
}
