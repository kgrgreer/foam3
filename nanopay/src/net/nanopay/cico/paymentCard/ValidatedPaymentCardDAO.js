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
  name: 'ValidatedPaymentCardDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.*',
    'net.nanopay.cico.paymentCard.model.PaymentCard',
    'net.nanopay.cico.paymentCard.model.PaymentCardType'
  ],

  constants: [
    {
      name: 'GLOBAL_PAYMENT_CARD_CREATE',
      type: 'String',
      value: 'paymentCard.create.*'
    },
    {
      name: 'GLOBAL_PAYMENT_CARD_READ',
      type: 'String',
      value: 'paymentCard.read.*'
    },
    {
      name: 'GLOBAL_PAYMENT_CARD_UPDATE',
      type: 'String',
      value: 'paymentCard.update.*'
    },
    {
      name: 'GLOBAL_PAYMENT_CARD_DELETE',
      type: 'String',
      value: 'paymentCard.remove.*'
    }
  ],

  messages: [
    { name: 'CARD_EXPIRED_ERROR_MSG', message: 'Card has expired' },
    { name: 'INVALID_CARD_NUM_ERROR_MSG', message: 'Invalid card number' }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ValidatedPaymentCardDAO(X x, DAO delegate) {
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
        User user = ((Subject) x.get("subject")).getUser();
        PaymentCard card = (PaymentCard) obj;
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_CREATE) || ! auth.check(x, GLOBAL_PAYMENT_CARD_UPDATE) ) {
          throw new AuthorizationException();
        }

        if ( card.getExpirationDate() != null && card.isExpired() ) {
          throw new RuntimeException(CARD_EXPIRED_ERROR_MSG);
        }

        if ( card.getType() == PaymentCardType.CREDIT || card.getType() == PaymentCardType.DEBIT ) {
          /*
           *  To validate the credit card, we use Luhn's algorithm
           *  https://en.wikipedia.org/wiki/Luhn_algorithm
           *
           *  1. Check the checkDigit/hashCode which is the last number on the
           *     card
           *  2. Check if the sum after the algorithm is of mod 10.
           */
          if ( ! this.validateCard(card.getNumber()) ) {
            throw new RuntimeException(INVALID_CARD_NUM_ERROR_MSG);
          }
        }
        return getDelegate().put_(x, obj);
      `
    },
    {
      name: 'find_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_READ) ) {
          throw new AuthorizationException();
        }

        return getDelegate().find_(x, id);
      `
    },
    {
      name: 'select_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_READ) ) {
          throw new AuthorizationException();
        }

        return getDelegate().select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_DELETE) ) {
          throw new AuthorizationException();
        }

        return getDelegate().remove_(x, obj);
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
        User user = ((Subject) x.get("subject")).getUser();
        AuthService auth = (AuthService) x.get("auth");

        if ( user == null ) {
          throw new AuthenticationException();
        }

        if ( ! auth.check(x, GLOBAL_PAYMENT_CARD_DELETE) ) {
          throw new AuthorizationException();
        }

        getDelegate().removeAll_(x, skip, limit, order, predicate);
      `
    },
    {
      name: 'convertToInt',
      visibility: 'protected',
      type: 'int[]',
      args: [
        { type: 'String', name: 'number' }
      ],
      javaCode: `
        /* convert to array of int for simplicity */
        int[] digits = new int[number.length()];
        for (int i = 0; i < number.length(); i++) {
          digits[i] = Character.getNumericValue(number.charAt(i));
        }
        return digits;
      `
    },
    {
      name: 'doubleEveryOtherInt',
      visibility: 'protected',
      type: 'int[]',
      args: [
        { type: 'int[]', name: 'digits' }
      ],
      javaCode: `
        /* double every other starting from right - jumping from 2 in 2 */
        for (int i = digits.length - 1; i >= 0; i -= 2)	{
          digits[i] += digits[i];

          /* taking the sum of digits grater than 10 - simple trick by substract 9 */
          if (digits[i] >= 10) {
            digits[i] = digits[i] - 9;
          }
        }
        return digits;
      `
    },
    {
      name: 'validateCheckDigit',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'String', name: 'number' },
        { type: 'char', name: 'checkDigit' }
      ],
      javaCode: `
        if (number == null) { return false; }
        String digit;

        int[] digits = convertToInt(number);

        digits = doubleEveryOtherInt(digits);

        int sum = 0;
        for (int i = 0; i < digits.length; i++) {
          sum += digits[i];
        }
        /* multiply by 9 step */
        sum = sum * 9;

        /* convert to string to be easier to take the last digit */
        digit = sum + "";
        return checkDigit == digit.charAt(digit.length() - 1);
      `
    },
    {
      name: 'validateCard',
      visibility: 'protected',
      type: 'boolean',
      args: [
        { type: 'String', name: 'card' }
      ],
      javaCode: `
        char checkDigit = card.charAt(card.length() - 1);

        if ( !validateCheckDigit(card.substring(0, card.length() - 1), checkDigit) ) {
          return false;
        }

        int[] digits = convertToInt(card.substring(0, card.length() - 1));
        digits = doubleEveryOtherInt(digits);

        int sum = Character.getNumericValue(checkDigit);
        for (int i = 0; i < digits.length; i++) {
          sum += digits[i];
        }

        return sum % 10 == 0;
      `
    }
  ]
});
