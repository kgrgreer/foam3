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
  package: 'net.nanopay.tx.ruler',
  name: 'ComplianceTransactionPlanner',

  documentation: 'Plans compliance transaction before the transaction that actually transfers money/value to another user.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.cico.VerificationTransaction',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        TransactionQuote quote = (TransactionQuote) obj;
        for ( Transaction plan : quote.getPlans() ) {
          if ( plan instanceof ComplianceTransaction
            || plan instanceof SummaryTransaction
            || plan instanceof FXSummaryTransaction
            || plan instanceof VerificationTransaction
            || plan.findSourceAccount(x).getOwner() == plan.findDestinationAccount(x).getOwner()
          ) {
            continue;
          }

          ComplianceTransaction ct = new ComplianceTransaction.Builder(x).build();
          ct.copyFrom(plan);
          ct.clearId();
          ct.clearLineItems();
          ct.clearNext();
          ct.addNext(plan);
          quote.setPlan(ct);
        }
      `
    }
  ]
});
