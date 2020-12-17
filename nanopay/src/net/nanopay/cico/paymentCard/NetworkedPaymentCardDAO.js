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
  name: 'NetworkedPaymentCardDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.cico.paymentCard.model.PaymentCard',
    'net.nanopay.cico.paymentCard.model.PaymentCardNetwork',
    'net.nanopay.cico.paymentCard.model.PaymentCardType',

    'java.util.regex.Pattern'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          final Pattern REGEX_VISA       = Pattern.compile("^4[0-9]{12}(?:[0-9]{3})?$");
          final Pattern REGEX_MASTERCARD = Pattern.compile("^(?:5[1-5][0-9]{2}|222[1-9]|22[3-9][0-9]|2[3-6][0-9]{2}|27[01][0-9]|2720)[0-9]{12}$");
          final Pattern REGEX_DISCOVER   = Pattern.compile("^6(?:011|5[0-9]{2})[0-9]{12}$");
          final Pattern REGEX_AMEX       = Pattern.compile("^3[47][0-9]{13}$");
          final Pattern REGEX_DINERSCLUB = Pattern.compile("^3(?:0[0-5]|[68][0-9])[0-9]{11}");
          final Pattern REGEX_JCB        = Pattern.compile("^(?:2131|1800|35\\\\d{3})\\\\d{11}$");

          public NetworkedPaymentCardDAO(X x, DAO delegate) {
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
  
        if ( card.getType() == PaymentCardType.CREDIT || card.getType() == PaymentCardType.DEBIT ) {
          if ( isVisa(card.getNumber()) ) {
            card.setNetwork(PaymentCardNetwork.VISA);
          } else if ( isMasterCard(card.getNumber()) ) {
            card.setNetwork(PaymentCardNetwork.MASTERCARD);
          } else if ( isDiscover(card.getNumber()) ) {
            card.setNetwork(PaymentCardNetwork.DISCOVER);
          } else if ( isAmex(card.getNumber()) ) {
            card.setNetwork(PaymentCardNetwork.AMERICANEXPRESS);
          } else if ( isDinersClub(card.getNumber()) ) {
            card.setNetwork(PaymentCardNetwork.DINERSCLUB);
          } else if ( isJCB(card.getNumber()) ) {
            card.setNetwork(PaymentCardNetwork.JCB);
          }
        }
  
        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'isVisa',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'String', name: 'number' }
      ],
      javaCode: `
        return REGEX_VISA.matcher(number).matches();
      `
    },
    {
      name: 'isMasterCard',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'String', name: 'number' }
      ],
      javaCode: `
        return REGEX_MASTERCARD.matcher(number).matches();
      `
    },
    {
      name: 'isDiscover',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'String', name: 'number' }
      ],
      javaCode: `
        return REGEX_DISCOVER.matcher(number).matches();
      `
    },
    {
      name: 'isAmex',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'String', name: 'number' }
      ],
      javaCode: `
        return REGEX_AMEX.matcher(number).matches();
      `
    },
    {
      name: 'isDinersClub',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'String', name: 'number' }
      ],
      javaCode: `
        return REGEX_DINERSCLUB.matcher(number).matches();
      `
    },
    {
      name: 'isJCB',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'String', name: 'number' }
      ],
      javaCode: `
        return REGEX_JCB.matcher(number).matches();
      `
    }
  ]
});
