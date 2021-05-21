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
  name: 'PaymentCardSanitizeDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'net.nanopay.cico.paymentCard.model.*',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.core.X',
    'net.nanopay.cico.paymentCard.model.StripePaymentCard',
    'net.nanopay.cico.paymentCard.model.RealexPaymentCard'
  ],

  messages: [
    { name: 'NOT_SELECTED_PAYMENT_CARD_PLATFORM_ERROR_MSG', message: 'Do not choose payment card platform' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PaymentCardSanitizeDAO(X x, DAO delegate) {
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
        String txnProcessorId = card.getTxnProcessor();
        if ( obj instanceof StripePaymentCard ||
              obj instanceof RealexPaymentCard
            ) {
          return getDelegate().put_(x, obj);
        } else {
          throw new RuntimeException(NOT_SELECTED_PAYMENT_CARD_PLATFORM_ERROR_MSG);
        }
      `
    }
  ]
});
