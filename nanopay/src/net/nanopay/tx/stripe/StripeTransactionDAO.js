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
  package: 'net.nanopay.tx.stripe',
  name: 'StripeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'java.util.HashMap',
    'java.util.Map',
    
    'com.stripe.Stripe',
    'com.stripe.exception.StripeException',
    'com.stripe.model.Charge',
    'com.stripe.net.RequestOptions',
    
    'foam.core.Currency',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.cico.paymentCard.model.StripePaymentCard',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  constants: [
    {
      type: 'Long',
      name: 'STRIPE_ID',
      value: 2
    }
  ],

  messages: [
    { name: 'PAYER_PAYEE_CANNOT_BE_SAME_ERROR_MSG', message: 'Payer can not be equal to payee' },
    { name: 'CANNOT_FIND_PAYMENT_CARD_ERROR_MSG', message: 'Can not find payment card' },
    { name: 'NOT_SUPPORTED_PAYMENT_TYPE_ERROR_MSG', message: 'Payment Type is not supported' },
    { name: 'STRIPE_TRANS_FAIL_ERROR_MSG', message: 'Stripe transaction failed' }
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'RequestOptions',
      name: 'options'
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public StripeTransactionDAO(X x, DAO delegate) {
            this(x, "pk_test_sEkkCjZ4jZt2WkJ6iqqyIGLW", delegate);
          }
        
          public StripeTransactionDAO(X x, String apiKey, DAO delegate) {
            setX(x);
            //setOptions(RequestOptions.builder().setApiKey(apiKey).build());
            setDelegate(delegate);
            Stripe.apiKey = "sk_test_KD0gUbEr1pATM7mTcB3eKNa0";
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
        if ( ! ( obj instanceof StripeTransaction ) ) {
          return super.put_(x, obj);
        }
    
        DAO accountDAO = (DAO) x.get("accountDAO");
        StripeTransaction transaction = (StripeTransaction) obj;
        DAO localTransactionDAO = (DAO) x.get("localTransactionDAO");
        DAO localUserDAO = (DAO) x.get("localUserDAO");
        Logger logger = (Logger) x.get("logger");
    
        long payerId = transaction.getPayerId();
        long payeeId = transaction.getPayeeId();
    
        if ( payerId == payeeId ) {
          logger.error(PAYER_PAYEE_CANNOT_BE_SAME_ERROR_MSG);
          throw new RuntimeException(PAYER_PAYEE_CANNOT_BE_SAME_ERROR_MSG);
        }
        User payerUser = (User) localUserDAO.find(payerId);
        User payeeUser = (User) localUserDAO.find(payeeId);
    
        DigitalAccount payerDigitalAccount = DigitalAccount.findDefault(getX(), payerUser, transaction.getSourceCurrency());
        DigitalAccount payeeDigitalAccount = DigitalAccount.findDefault(getX(), payeeUser, transaction.getDestinationCurrency());
        transaction.setSourceAccount(payerDigitalAccount.getId());
        transaction.setDestinationAccount(payeeDigitalAccount.getId());
    
        // Caculate extra charge for the apple pay.
        if ( transaction.getIsRequestingFee() ) {
          double amount = transaction.getAmount() / 100.0;
          amount = amount * 0.0325;
          amount = amount * 100;
          transaction.setFee((long) amount);
          return transaction;
        }
    
        DAO currencyDAO = (DAO) x.get("currencyDAO");
        Currency currency = (Currency) currencyDAO.find(transaction.getCurrencyId().toString());
    
        Map<String, Object> chargeMap = new HashMap<String, Object>();
        chargeMap.put("currency", ((String) currency.getId()).toLowerCase());
        //chargeMap.put("description", transaction.getNotes());
    
        if ( transaction.getPaymentType() == net.nanopay.cico.CICOPaymentType.MOBILE ) {
          double fee = transaction.getAmount() / 100.0;
          fee = fee * 0.0325;
          fee = fee * 100;
          transaction.setFee((long) fee);
          chargeMap.put("amount", transaction.getAmount() + ((long) fee)); // Include the 3.25% fee
          chargeMap.put("source", transaction.getMobileToken());
        } else if ( transaction.getPaymentType() == net.nanopay.cico.CICOPaymentType.PAYMENTCARD ) {
          DAO paymentCardDAO = (DAO) x.get("paymentCardDAO");
    
          StripePaymentCard paymentCard = (StripePaymentCard) paymentCardDAO.find_(x, transaction.getPaymentCardId());
    
          if ( paymentCard == null ) {
            logger.error(CANNOT_FIND_PAYMENT_CARD_ERROR_MSG);
            throw new RuntimeException(CANNOT_FIND_PAYMENT_CARD_ERROR_MSG);
          }
    
          chargeMap.put("amount", transaction.getAmount());
          chargeMap.put("customer", paymentCard.getStripeCustomerId());
        } else {
          logger.error(NOT_SUPPORTED_PAYMENT_TYPE_ERROR_MSG);
          throw new RuntimeException(NOT_SUPPORTED_PAYMENT_TYPE_ERROR_MSG);
        }
    
      Charge charge = null;
        try {
          charge = Charge.create(chargeMap, this.options_);
          transaction.setStripeChargeId(charge.getId());
          transaction.setStatus(TransactionStatus.COMPLETED);
          return getDelegate().put_(x, transaction);
        } catch (StripeException e){
          transaction.setStatus(TransactionStatus.DECLINED);
          getDelegate().put_(x, transaction);
          logger.error(STRIPE_TRANS_FAIL_ERROR_MSG, e);
          if(SafetyUtil.isEmpty(e.getMessage()))
            throw new RuntimeException(STRIPE_TRANS_FAIL_ERROR_MSG);
          else
            throw new RuntimeException(e.getMessage());
        }
      `
    }
  ]
});

