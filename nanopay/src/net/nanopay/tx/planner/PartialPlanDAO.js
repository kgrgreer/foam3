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
    'java.util.UUID',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.SummaryTransaction',
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
        // -- Skip for non partial plan --
        if ( ((TransactionQuote) obj).getPartialTransaction() == null )
          getDelegate().put_(x, obj);

        TransactionQuote tq = (TransactionQuote) obj;
        Transaction leg2 = tq.getPlan();
        Transaction partial = tq.getPartialTransaction();
        String estimation = partial.getDestinationAccount();

        // -- set summary and compliance destinations to new destination --
        partial.setDestinationAccount(leg2.getDestinationAccount()); // summary
        Transaction t = partial.getNext()[0];
        t.setDestinationAccount(leg2.getDestinationAccount()); // compliance

        while ( t.getNext() != null ) { // conserve first leg
          if ( SafetyUtil.equals(t.getNext()[0].getDestinationAccount(), estimation) ) {
            t.setNext(null); // cut off the last leg.
            break;
          }
          t = t.getNext()[0];
        }

        // -- Assemble new plan --
        leg2 = removeSummaryTransaction(leg2);
        partial.addNext(leg2);
        partial.setId(UUID.randomUUID().toString());
        tq.setPlan(partial);
        Transaction[] ts = new Transaction [1];
        ts[0] = partial;
        tq.setPlans(ts);
        return getDelegate().put_(x, tq);
      `
    },
    {
      name: 'removeSummaryTransaction',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      documentation: 'Remove the summary and or compliance transaction from this chain.',
      javaCode: `
        boolean removed = false;
        if ( (txn != null) && (txn instanceof FXSummaryTransaction || txn instanceof SummaryTransaction) ) {
          txn = txn.getNext()[0];
          removed = true;
        }
        if ( (txn != null) && (txn instanceof ComplianceTransaction) ) {
          txn = txn.getNext()[0];
          removed = true;
        }
        if ( txn == null )
          throw new TransactionException("Error: Summary removal called on bare summary transaction.");
        if (removed)
          txn.setStatus(txn.getInitialStatus());
        return txn;
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
