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
  name: 'DuplicatePaymentCard',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'net.nanopay.cico.paymentCard.model.*',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.core.X',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.AND',
    
    'java.util.List'
  ],

  messages: [
    { name: 'DUPLICATE_PAYMENTCARD_ERROR_MSG', message: 'PaymentCard already exists' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public DuplicatePaymentCard(X x, DAO delegate) {
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
        DAO paymentCardDAO = (DAO) x.get("paymentCardDAO");
        ArraySink sink = (ArraySink) paymentCardDAO.where(
          AND (
            EQ(PaymentCard.NUMBER, card.getNumber()),
            EQ(PaymentCard.OWNER, card.getOwner()),
            EQ(PaymentCard.CARDHOLDER_NAME, card.getCardholderName())
          )
        ).select(new ArraySink());
        List list = sink.getArray();
        if ( list.size() == 0 )
          return getDelegate().put_(x, obj);
        else
          throw new RuntimeException(DUPLICATE_PAYMENTCARD_ERROR_MSG);
      `
    }
  ]
});
