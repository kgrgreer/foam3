package net.nanopay.tx.realex;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.ProxyDAO;
import foam.core.FObject;
import foam.dao.AbstractSink;
import java.util.*;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import net.nanopay.cico.paymentCard.model.PaymentCard;
import net.nanopay.tx.TransactionQuote;
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
import net.nanopay.cico.model.MobileWallet;
import static foam.mlang.MLang.*;
import foam.dao.ArraySink;
import net.nanopay.cico.model.RealexPaymentAccountInfo;
import net.nanopay.tx.TxnProcessor;
import net.nanopay.tx.TxnProcessorUserReference;
import java.util.UUID;
import net.nanopay.cico.paymentCard.model.RealexPaymentCard;

public class RealexTransactionDAO
 extends ProxyDAO
{
  public RealexTransactionDAO(X x, DAO delegate) {
    setX(x);
    setDelegate(delegate);
  }

  @Override
  public FObject put_(X x, FObject obj) {
    if ( ! ( obj instanceof RealexTransaction ) ) {
      return super.put_(x, obj);
    }

    RealexTransaction transaction = (RealexTransaction) obj;
    //figure out the type of transaction: mobile, savedbankCard, and one-off
    PaymentRequest paymentRequest = new PaymentRequest();
    RealexPaymentAccountInfo paymentAccountInfo = (RealexPaymentAccountInfo) transaction.getPaymentAccountInfo();
    DAO localTransactionDAO = (DAO) x.get("localTransactionDAO");
    DAO localTransactionQuotePlanDAO = (DAO) x.get("localTransactionQuotePlanDAO");
    Logger logger = (Logger) x.get("logger");
    if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.MOBILE ) {
      paymentRequest
        .addType(PaymentType.AUTH_MOBILE)
        .addMerchantId(paymentAccountInfo.getMerchantId())
        .addOrderId(UUID.randomUUID().toString())
        .addAutoSettle(new AutoSettle().addFlag(AutoSettle.AutoSettleFlag.TRUE))
        .addToken(paymentAccountInfo.getToken());
      if ( MobileWallet.GOOGLEPAY == paymentAccountInfo.getMobileWallet() )
        paymentRequest.addMobile("pay-with-google");
      else if ( MobileWallet.APPLEPAY == paymentAccountInfo.getMobileWallet() )
        paymentRequest.addMobile("apple-pay");
    } else if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.PAYMENTCARD ) {
      User user = (User) x.get("user");
      DAO currencyDAO = (DAO) x.get("currencyDAO");
      net.nanopay.model.Currency currency = (net.nanopay.model.Currency) currencyDAO.find(paymentAccountInfo.getCurrencyId().toString());
      DAO paymentCardDAO = (DAO) x.get("paymentCardDAO");
      long cardId = paymentAccountInfo.getPaymentCardId();
      RealexPaymentCard paymentCard = (RealexPaymentCard) paymentCardDAO.find_(x, cardId);
      DAO txnProcessorUserReferenceDAO = (DAO) x.get("txnProcessorUserReferenceDAO");
      ArraySink sink = (ArraySink) txnProcessorUserReferenceDAO
        .where(
               AND(
                   EQ(TxnProcessorUserReference.PROCESSOR_ID, TxnProcessor.REALEX /*txnProcessorId*/),
                   EQ(TxnProcessorUserReference.USER_ID, user.getId())
                   )
               )
        .select(new ArraySink());
      List list = sink.getArray();
      if ( list.size() == 0 ) {
        logger.error("Please add Payment Card again");
        throw new RuntimeException("Please add Payment Card again");
      }
      TxnProcessorUserReference userReference = (TxnProcessorUserReference) list.get(0);
      PaymentData myPaymentData = new PaymentData()
        .addCvnNumber(paymentAccountInfo.getCvn());
      paymentRequest
        .addType(PaymentType.RECEIPT_IN)
        .addMerchantId(paymentAccountInfo.getMerchantId())
        .addAmount(transaction.getAmount())
        .addOrderId(UUID.randomUUID().toString())
        .addCurrency((String) currency.getId())
        .addPaymentMethod(paymentCard.getRealexCardReference())
        .addPaymentData(myPaymentData)
        .addAutoSettle(new AutoSettle().addFlag(AutoSettle.AutoSettleFlag.TRUE));
      paymentRequest.addPayerReference(userReference.getReference());
    } else if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.ONEOFF ) {
      logger.error("One-off do not support");
      throw new RuntimeException("One-off do not support");
    } else {
      logger.error("Unknown payment type for Realex platform");
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
      if ( ! "00".equals(response.getResult()) ) {
        transaction.setStatus(TransactionStatus.DECLINED);
        getDelegate().put_(x, transaction);
        logger.error("fail to cashIn by Realex, error message: " + response.getMessage());
        throw new RuntimeException("fail to cashIn by Realex, error message: " + response.getMessage());
      }
      transaction.setStatus(TransactionStatus.COMPLETED);
      paymentAccountInfo.setToken("");
      TransactionQuote quote = new TransactionQuote.Builder(getX())
        .setRequestTransaction(transaction)
        .build();
      quote = (TransactionQuote) localTransactionQuotePlanDAO.put(quote);
      localTransactionDAO.put(quote.getPlan());
      Transaction txn = (Transaction) getDelegate().put_(x, quote.getPlan());
      // TODO: add FeeTransaction in RealexTransactionPlanDAO

      // if ( paymentAccountInfo.getType() == net.nanopay.cico.CICOPaymentType.MOBILE && txn.getStatus() == TransactionStatus.COMPLETED ) {
      //   // REVIEW: this should be a Transfer, not a Transaction.
      //   //create new transaction for the fee
      //   Transaction transaction = new Transaction.Builder(getX())
      //     .setPayerId(transaction.getPayerId())
      //     .setPayeeId(3797) //TODO: create fee collector user
      //     .setStatus(TransactionStatus.COMPLETED)
      //     .setAmount(paymentAccountInfo.getFee())
      //     .build();
      //   TransactionQuote quote = new TransactionQuote.Builder(getX())
      //     .setRequestTransaction(transaction)
      //     .build();
      //   quote = localTransactionQuotePlanDAO_.put(quote);
      //   localTransactionDAO.put(quote.getPlan());
      // }
      return txn;
    } catch ( RealexServerException e ) {
      logger.error(e);
      throw new RuntimeException(e);
    } catch ( RealexException e ) {
      logger.error(e);
      throw new RuntimeException(e);
    } catch ( Throwable e ) {
      logger.error(e);
      throw new RuntimeException(e);
    }
  }
}
