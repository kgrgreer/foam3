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
  package: 'net.nanopay.cico.paymentCard',
  name: 'RealexPaymentCardStoreDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    
    'java.util.List',
    'java.util.UUID',
    
    'com.realexpayments.remote.sdk.RealexClient',
    'com.realexpayments.remote.sdk.RealexException',
    'com.realexpayments.remote.sdk.RealexServerException',
    'com.realexpayments.remote.sdk.domain.Card',
    'com.realexpayments.remote.sdk.domain.Card.CardType',
    'com.realexpayments.remote.sdk.domain.Payer',
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
    'foam.util.SafetyUtil',
    'net.nanopay.cico.paymentCard.model.PaymentCardNetwork',
    'net.nanopay.cico.paymentCard.model.RealexPaymentCard',
    'net.nanopay.tx.TxnProcessorUserReference'
  ],

  messages: [
    { name: 'CREATE_PAYER_BY_REALEX_ERROR_MSG', message: 'Fail to create Payer by Realex' },
    { name: 'DISCOVER_CARD_TYPE_NOT_SUPPORTED_ERROR_MSG', message: 'Card Type DISCOVER is not supported' },
    { name: 'UNSUPPORTED_CARD_TYPE_ERROR_MSG', message: 'Card Type is not supported' },
    { name: 'STORE_CARD_BY_REALEX_ERROR_MSG', message: 'Fail to store Card by Realex' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public RealexPaymentCardStoreDAO(X x, DAO delegate) {
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
        if ( ! (obj instanceof RealexPaymentCard) )
          return getDelegate().put_(x, obj);

        RealexPaymentCard card = (RealexPaymentCard) obj;
        User user = ((Subject) x.get("subject")).getUser();
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
              throw new RuntimeException(CREATE_PAYER_BY_REALEX_ERROR_MSG + ", error message: " + response.getMessage());
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
          throw new RuntimeException(DISCOVER_CARD_TYPE_NOT_SUPPORTED_ERROR_MSG);
        } else {
          throw new RuntimeException(UNSUPPORTED_CARD_TYPE_ERROR_MSG);
        }
        PaymentRequest request = new PaymentRequest()
          .addType(PaymentType.CARD_NEW)
          .addMerchantId(card.getExternalParameters().get("merchantId").toString())
          .addCard(myCard);
        try {
          PaymentResponse response = call(request);
          if ( ! "00".equals(response.getResult()) ) {
            throw new RuntimeException(STORE_CARD_BY_REALEX_ERROR_MSG + ", error message: " + response.getMessage());
          }
          card.setRealexCardReference(cardReference);
        } catch ( Throwable e ) {
          throw new RuntimeException(e);
        }
        return getDelegate().put_(x, card);
      `
    },
    {
      name: 'call',
      visibility: 'protected',
      type: 'PaymentResponse',
      args: [
        { type: 'PaymentRequest', name: 'request' }
      ],
      javaThrows: [
        'RealexException',
        'RealexServerException',
      ],
      javaCode: `
        HttpConfiguration HttpConfiguration = new HttpConfiguration();
        HttpConfiguration.setEndpoint("https://api.sandbox.realexpayments.com/epage-remote.cgi");
        //TODO: do not hard code secret
        RealexClient client = new RealexClient("secret", HttpConfiguration);
        return client.send(request);
      `
    }
  ]
});

