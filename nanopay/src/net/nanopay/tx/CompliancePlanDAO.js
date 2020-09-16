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
  package: 'net.nanopay.tx',
  name: 'CompliancePlanDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Adds a compliance transaction right after SummaryTransaction
    and FXSummaryTransaction.`,

  javaImports: [
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'java.util.ArrayList',
    'java.util.List'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) getDelegate().put_(x, obj);
        for ( Transaction plan : quote.getPlans() ) {
          if ( plan instanceof SummaryTransaction
            || plan instanceof FXSummaryTransaction
          ) {
            ComplianceTransaction ct = new ComplianceTransaction.Builder(x).build();
            ct.copyFrom(plan);
            ct.setInitialStatus(TransactionStatus.PENDING);
            ct.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
            ct.clearLineItems();
            plan.setNext(new Transaction[] { ct });
          }
        }

        return quote;
      `
    }
  ]
});
