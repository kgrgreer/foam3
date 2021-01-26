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
  name: 'PartialPlanDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'In charge of continuing the planning of partial plans.',

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.User',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.planner.AbstractTransactionPlanner',
    'net.nanopay.tx.planner.TransactionPlan',
    'foam.core.ValidationException',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.TransactionException',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.tx.UnsupportedTransactionException',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.OR',
    'net.nanopay.account.Account',
    'foam.mlang.sink.Count'
  ],


  methods: [
    {
      name: 'put_',
      javaCode: `
        
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PartialPlanDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
