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
          return getDelegate().put_(x, obj);
        // -- set up --
        TransactionQuote tq = (TransactionQuote) obj;
        Transaction[] newPlans = tq.getPlans();

        Transaction oldPartialPlan = tq.getPartialTransaction();
        Transaction headOldPartialPlan = oldPartialPlan;
        String estimation = oldPartialPlan.getDestinationAccount();
        String intermediary = "";
        Transaction cutOffEnd = null;
        // -- walk to get intermediary, and cut leg2 off --
        while ( oldPartialPlan.getNext() != null ) { // conserve summaries and first leg
          if ( SafetyUtil.equals(oldPartialPlan.getNext()[0].getDestinationAccount(), estimation) ) {
            intermediary = oldPartialPlan.getNext()[0].getSourceAccount(); // save the intermediary.
            cutOffEnd = oldPartialPlan.getNext()[0];
            oldPartialPlan.setNext(null); // cut off the last leg.
            break;
          }
          oldPartialPlan = oldPartialPlan.getNext()[0]; // this is now the last txn in old partial.
        }

        // -- walk the newplans to find the correct new plan --
        ArrayList<Transaction> eligibleNewPlans = new ArrayList<Transaction>();

        for ( Transaction txn : newPlans ) {
          Boolean eligible = false;
          Transaction summary = txn;
          while ( txn.getNext() != null ) {
            if (SafetyUtil.equals(txn.getNext()[0].getSourceAccount(), intermediary) ) {
              summary = txn.getNext()[0];
              eligible = true;
              break;
            }
            txn = txn.getNext()[0];
          }
          if ( eligible )
            eligibleNewPlans.add(summary);
        }

        // -- set ids of old leg2 to the new leg2 candidates --
        for ( Transaction head : eligibleNewPlans ) {
          Transaction oldHead = cutOffEnd;
          while( head.getNext()[0] != null ) {
            head.setId(oldHead.getId());
            head = head.getNext()[0];
            oldHead = oldHead.getNext()[0];
          }
        }

        // -- set summary and compliance destinations to new destination --
        headOldPartialPlan.setDestinationAccount(tq.getDestinationAccount().getId()); // summary
        headOldPartialPlan.getNext()[0].setDestinationAccount(tq.getDestinationAccount().getId()); // compliance

        // -- glue front and back parts together --
        ArrayList<Transaction> finalNewPlans = new ArrayList<Transaction>();
        for ( Transaction newTail : eligibleNewPlans ) {
          Transaction[] leg2 = new Transaction[1];
          leg2[0] = newTail;
          oldPartialPlan.setNext(leg2);
          Transaction newTxn = (Transaction) headOldPartialPlan.fclone();
          newTxn.setId(UUID.randomUUID().toString());
          finalNewPlans.add(newTxn);
        }

        // -- FillQuote --

        tq.setPlan(null);
        Transaction[] ts = (Transaction[]) finalNewPlans.toArray();
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
