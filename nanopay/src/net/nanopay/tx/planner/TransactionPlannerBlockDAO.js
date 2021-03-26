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
  package: 'net.nanopay.tx.planner',
  name: 'TransactionPlannerBlockDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    Courtesy block of transactions with ids from going into planner dao. Not blocking will lead to plan loss. also block bad puts to prevent network spam.
  `,

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.UnsupportedTransactionException',
    'foam.core.ValidationException',
    'foam.util.SafetyUtil'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
      // TODO: swap runtime errors for Transaction Request Error Codes.
        if ( obj instanceof Transaction && ! SafetyUtil.isEmpty(((Transaction) obj).getId()) )
          throw new ValidationException("Only transactions without an ID can be planned");
        if ( obj instanceof Transaction || obj instanceof TransactionQuote )
          return getDelegate().put_(x, obj);
        throw new UnsupportedTransactionException("Only Transaction and TransactionQuote can be sent for planning");
      `
    },
    {
      name: 'find_',
      javaCode: `
        return null;
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return null;
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TransactionPlannerBlockDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
