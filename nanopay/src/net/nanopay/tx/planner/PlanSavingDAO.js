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
  name: 'PlanSavingDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'Saves plans into an mdao, and strips off fields that are not meant to be seen by user',

  javaImports: [
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.FxSummaryTransactionLineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.bank.EstimationAccount'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( ((TransactionQuote) obj).getDestinationAccount() instanceof EstimationAccount ) {
          for ( Transaction t : ((TransactionQuote) obj).getPlans() )
            getDelegate().put_(x, new TransactionPlan(t, false));
        }
        else {
          for ( Transaction t : ((TransactionQuote) obj).getPlans() )
            getDelegate().put_(x, new TransactionPlan(t, true));
        }
        return obj;
      `
    },
    {
      name: 'remove_',
      documentation: 'remove the plan that the object refers to',
      javaCode: `
      if ( obj instanceof Transaction )
        remove_( x, getDelegate().find_(x, ((Transaction) obj).getId()) );
      return getDelegate().remove_( x, obj );
      `
    },
    {
      name: 'find_',
      javaCode: `
      if ( id instanceof Transaction )
        return find_(x, super.find_(x, ((Transaction) id).getId()) );
      if ( id instanceof TransactionQuote )
        return null; // short circuit rule engine oldObj find
      return super.find_(x, id);
      `
    },
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PlanSavingDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
