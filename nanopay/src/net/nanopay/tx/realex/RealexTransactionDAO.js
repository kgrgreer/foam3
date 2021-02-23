/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx.realex',
  name: 'RealexTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',

    'java.util.List',
    'java.util.UUID',

    'com.realexpayments.remote.sdk.RealexClient',
    'com.realexpayments.remote.sdk.RealexException',
    'com.realexpayments.remote.sdk.RealexServerException',
    'com.realexpayments.remote.sdk.domain.PaymentData',
    'com.realexpayments.remote.sdk.domain.payment.AutoSettle',
    'com.realexpayments.remote.sdk.domain.payment.PaymentRequest',
    'com.realexpayments.remote.sdk.domain.payment.PaymentRequest.PaymentType',
    'com.realexpayments.remote.sdk.domain.payment.PaymentResponse',
    'com.realexpayments.remote.sdk.http.HttpConfiguration',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'net.nanopay.cico.model.MobileWallet',
    'net.nanopay.cico.model.RealexPaymentAccountInfo',
    'net.nanopay.cico.paymentCard.model.RealexPaymentCard',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.TxnProcessor',
    'net.nanopay.tx.TxnProcessorUserReference',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  messages: [
    { name: 'ADD_PAYMENT_CARD_AGAIN_ERROR_MSG', message: 'Please add Payment Card again' },
    { name: 'ONEOFF_NOT_SUPPORTED_ERROR_MSG', message: 'One-off is not supported' },
    { name: 'UNKNOWN_PAYMENT_TYPE_ERROR_MSG', message: 'Unknown payment type for Realex platform' },
    { name: 'CASHIN_FAIL_BY_REALEX_ERROR_MSG', message: 'fail to cashIn by Realex' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public RealexTransactionDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }    
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
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
          User user = ((Subject) x.get("subject")).getUser();
          DAO currencyDAO = (DAO) x.get("currencyDAO");
          foam.core.Currency currency = (foam.core.Currency) currencyDAO.find(paymentAccountInfo.getCurrencyId().toString());
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
            logger.error(ADD_PAYMENT_CARD_AGAIN_ERROR_MSG);
            throw new RuntimeException(ADD_PAYMENT_CARD_AGAIN_ERROR_MSG);
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
          logger.error(ONEOFF_NOT_SUPPORTED_ERROR_MSG);
          throw new RuntimeException(ONEOFF_NOT_SUPPORTED_ERROR_MSG);
        } else {
          logger.error(UNKNOWN_PAYMENT_TYPE_ERROR_MSG);
          throw new RuntimeException(UNKNOWN_PAYMENT_TYPE_ERROR_MSG);
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
            logger.error(CASHIN_FAIL_BY_REALEX_ERROR_MSG + ", error message: " + response.getMessage());
            throw new RuntimeException(CASHIN_FAIL_BY_REALEX_ERROR_MSG + ", error message: " + response.getMessage());
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
      `
    }
  ]
});
