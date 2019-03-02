/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'RetailTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Plan generated specifically for Retail transaction, sets plan to be returned right away`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'enabled',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `

    TransactionQuote quote = (TransactionQuote) obj;
    Transaction request = quote.getRequestTransaction();

    if ( ! (request instanceof RetailTransaction) ) {
      return getDelegate().put_(x, quote);
    }
    request.setIsQuoted(true);
    quote.addPlan(request);
    quote.setPlan(request);

    return getDelegate().put_(x, quote);
    `
    },
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
public RetailTransactionPlanDAO(foam.core.X x, foam.dao.DAO delegate) {
  System.err.println("Direct constructor use is deprecated. Use Builder instead.");
  setDelegate(delegate);
}
        `);
      },
    },
  ]
});
