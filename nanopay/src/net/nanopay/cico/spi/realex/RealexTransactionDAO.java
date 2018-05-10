package net.nanopay.cico.spi.realex;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import java.util.*;
import foam.nanos.auth.User;
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
    //type: mobile, paymentCard, or one-off. String type
    if ( "mobile".equals(paymentData.get("type")) ) {
      paymentRequest = new PaymentRequest()
        .addType(PaymentType.AUTH_MOBILE)
        .addMerchantId((String) paymentData.get("merchantId")) //for Varipay is varipay. String type
        .addOrderId(Long.toString(transaction.getId()))
        .addAutoSettle(new AutoSettle().addFlag(AutoSettle.AutoSettleFlag.TRUE))
        .addMobile((String) paymentData.get("mobileType")) //apple-pay or pay-with-google. String type
        .addToken((String) paymentData.get("token")); //String type
    } else if ( "paymentCard".equals(paymentData.get("type")) ) {
      User user = (User) x.get("user");

      PaymentData myPaymentData = new PaymentData()
        .addCvnNumber((String) paymentData.get("cvn")); //three digits. String type
      paymentRequest = new PaymentRequest()
        .addType(PaymentType.RECEIPT_IN)
        .addMerchantId((String) paymentData.get("merchantId")) //for Varipay is varipay. String type
        .addAmount(transaction.getAmount())
        .addOrderId(Long.toString(transaction.getId()))
        .addCurrency("EUR")
        .addPayerReference("get from User")
        .addPaymentMethod("get from Card")
        .addPaymentData(myPaymentData)
        .addAutoSettle(new AutoSettle().addFlag(AutoSettle.AutoSettleFlag.TRUE));
    } else if ( "one-off".equals(paymentData.get("type")) ) {
      //TODO: need to get card info from user;
      Card card = new Card()
        .addType("")
        .addNumber("")
        .addExpiryDate("")
        .addCvn("")
        .addCvnPresenceIndicator(com.realexpayments.remote.sdk.domain.Cvn.PresenceIndicator.CVN_PRESENT)
        .addCardHolderName("");
      paymentRequest = new PaymentRequest()
        .addType(PaymentType.AUTH)
        .addMerchantId("")
        .addOrderId("")
        .addAccount("")
        .addAmount(0)
        .addCurrency("")
        .addCard(card);
    } else {
      throw new RuntimeException("Unknown payment type for Realex platform");
    }
    HttpConfiguration httpConfiguration = new HttpConfiguration();
    httpConfiguration.setEndpoint("https://test.realexpayments.com/epage-remote.cgi");
    RealexClient client = new RealexClient("Po8lRRT67a", httpConfiguration);
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