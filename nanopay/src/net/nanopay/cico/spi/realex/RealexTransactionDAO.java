package net.nanopay.cico.spi.realex;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import java.util.*;
import foam.nanos.auth.User;
import net.nanopay.cico.paymentCard.model.PaymentCard;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import com.realexpayments.remote.sdk.domain.payment.AutoSettle;
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
import com.realexpayments.remote.sdk.domain.Card;
import com.realexpayments.remote.sdk.domain.PaymentData;

public class RealexTransactionDAO
 extends ProxyDAO
{
  public RealexTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    Transaction transaction = (Transaction) obj;
    //If transaction is realex payment
    long payerId = transaction.getPayerId();
    //TODO: change to realex user id
    if ( ! (payerId == 0) ) return getDelegate().put_(x, obj);
    //get PaymentDATA
    //figure out the type of transaction: mobile, savedbankCard, and one-off
    PaymentRequest paymentRequest = null;
    Map paymentData = transaction.getPaymentData();
    if ( "mobile".equals(paymentData.get("type")) ) {
      paymentRequest = new PaymentRequest()
        .addType(PaymentType.AUTH_MOBILE)
        .addMerchantId((String) paymentData.get("merchantId")) 
        .addOrderId(Long.toString(transaction.getId()))
        .addAutoSettle(new AutoSettle().addFlag(AutoSettle.AutoSettleFlag.TRUE))
        .addMobile((String) paymentData.get("mobileType")) 
        .addToken((String) paymentData.get("token"));
    } else if ( "paymentCard".equals(paymentData.get("type")) ) {
      User user = (User) x.get("user");
      DAO paymentCardDAO = user.getPaymentCards(); 
      long cardId = (long) paymentData.get("paymentCardId"); 
      PaymentCard paymentCard = (PaymentCard) paymentCardDAO.find(cardId);
      PaymentData myPaymentData = new PaymentData()
        .addCvnNumber((String) paymentData.get("cvn"));
      paymentRequest = new PaymentRequest()
        .addType(PaymentType.RECEIPT_IN)
        .addMerchantId((String) paymentData.get("merchantId"))
        .addAmount(transaction.getAmount())
        .addOrderId(Long.toString(transaction.getId()))
        .addCurrency((String) paymentData.get("currency"))
        .addPayerReference(user.getRealexPayerReference())
        .addPaymentMethod(paymentCard.getRealexCardReference())
        .addPaymentData(myPaymentData)
        .addAutoSettle(new AutoSettle().addFlag(AutoSettle.AutoSettleFlag.TRUE));
    } else if ( "one-off".equals(paymentData.get("type")) ) {
      //TODO: do not support right now
    } else {
      throw new RuntimeException("Unknown payment type for Realex platform");
    }
    HttpConfiguration HttpConfiguration = new HttpConfiguration();
    HttpConfiguration.setEndpoint("https://api.sandbox.realexpayments.com/epage-remote.cgi");
    //TODO: do not hard code secret
    RealexClient client = new RealexClient("secret", HttpConfiguration);
    PaymentResponse response = null;
    try {
      response = client.send(paymentRequest);
      // '00' == success
      if ( ! "00".equals(response.getResult()) ) 
        throw new RuntimeException("fail to cashIn by Realex, error message: " + response.getMessage());
    } catch ( RealexServerException e ) {
      throw new RuntimeException("Error to send transaction with Realex");
    } catch ( RealexException e ) {
      throw new RuntimeException("Error to send transaction with Realex");
    } finally {
      if ( "00".equals(response.getResult()) )
        transaction.setStatus(TransactionStatus.COMPLETED);
      else
        transaction.setStatus(TransactionStatus.DECLINED);
      return getDelegate().put_(x, transaction);
    }
  }
}