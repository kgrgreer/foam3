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
