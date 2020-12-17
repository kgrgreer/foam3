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
  name: 'RealexVerificationPaymentCardDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'java.util.Map',
    'java.util.UUID',
    
    'com.realexpayments.remote.sdk.RealexClient',
    'com.realexpayments.remote.sdk.RealexException',
    'com.realexpayments.remote.sdk.RealexServerException',
    'com.realexpayments.remote.sdk.domain.Card',
    'com.realexpayments.remote.sdk.domain.Card.CardType',
    'com.realexpayments.remote.sdk.domain.Cvn.PresenceIndicator',
    'com.realexpayments.remote.sdk.domain.payment.PaymentRequest',
    'com.realexpayments.remote.sdk.domain.payment.PaymentRequest.PaymentType',
    'com.realexpayments.remote.sdk.domain.payment.PaymentResponse',
    'com.realexpayments.remote.sdk.http.HttpConfiguration',
    
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.cico.paymentCard.model.PaymentCard',
    'net.nanopay.cico.paymentCard.model.PaymentCardNetwork'
  ],

  messages: [
    { name: 'REALEX_VERIFY_FAIL_ERROR_MSG', message: 'fail to verify by Realex, error message: ' },
    { name: 'RELAEX_OTB_VERIFY_NOT_ALLOWED_ERROR_MSG', message: 'Can not use Realex otb to verify card' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public RealexVerificationPaymentCardDAO(X x, DAO delegate) {
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
            throw new RuntimeException(REALEX_VERIFY_FAIL_ERROR_MSG + response.getMessage());
          return getDelegate().put_(x, obj);
        } catch ( RealexServerException e ) {
          throw new RuntimeException(RELAEX_OTB_VERIFY_NOT_ALLOWED_ERROR_MSG);
        } catch ( RealexException e ) {
          throw new RuntimeException(RELAEX_OTB_VERIFY_NOT_ALLOWED_ERROR_MSG);
        }
      `
    }
  ]
});

