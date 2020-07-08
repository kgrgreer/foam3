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
  name: 'StripePaymentCardDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'java.util.HashMap',
    'java.util.Map',
    
    'com.stripe.Stripe',
    'com.stripe.exception.APIConnectionException',
    'com.stripe.exception.APIException',
    'com.stripe.exception.AuthenticationException',
    'com.stripe.exception.CardException',
    'com.stripe.exception.InvalidRequestException',
    'com.stripe.model.Customer',
    'com.stripe.net.RequestOptions',
    
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'net.nanopay.cico.paymentCard.model.StripePaymentCard'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          protected static final RequestOptions options_;
          static {
            //options_ = RequestOptions.builder().setApiKey("pk_test_sEkkCjZ4jZt2WkJ6iqqyIGLW").build();
            options_ = null;
          }
        
          public StripePaymentCardDAO(X x, DAO delegate) {
            setX(x);
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
        if ( ! (obj instanceof StripePaymentCard) )
          return getDelegate().put_(x, obj);

        StripePaymentCard paymentCard = (StripePaymentCard) obj;
        User user = ((Subject) x.get("subject")).getUser();

        try {
          Map<String, Object> params = new HashMap<String, Object>();
          params.put("source", paymentCard.getStripeCardToken());
          Customer customer = Customer.create(params);
          paymentCard.setStripeCustomerId(customer.getId());
        } catch ( APIException|CardException|APIConnectionException|InvalidRequestException|AuthenticationException t ) {
          throw new RuntimeException(t);
        }

        paymentCard.setNumber(paymentCard.getNumber().substring(paymentCard.getNumber().length() - 4, paymentCard.getNumber().length()));

        return getDelegate().put_(x, paymentCard);
      `
    }
  ]
});
