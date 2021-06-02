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
    'java.util.UUID',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.TransactionException',
    'net.nanopay.tx.planner.TransactionPlan',
    'foam.core.ValidationException',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.ComplianceTransaction',
    'net.nanopay.tx.SummarizingTransaction',
    'net.nanopay.tx.FxSummaryTransactionLineItem',
    'java.util.ArrayList',
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
          while( (head.getNext() != null) && (head.getNext().length != 0) ) {
            head.setId(oldHead.getId());
            head = head.getNext()[0];
            oldHead = oldHead.getNext()[0];
          }
        }

        // -- set summary and compliance destinations to new destination --
        headOldPartialPlan.setDestinationAccount(tq.getDestinationAccount().getId()); // summary
        if ( (headOldPartialPlan.getNext() != null) && (headOldPartialPlan.getNext().length > 0) &&
        (headOldPartialPlan.getNext()[0] instanceof ComplianceTransaction) ) {
          headOldPartialPlan.getNext()[0].setDestinationAccount(tq.getDestinationAccount().getId()); // compliance
        }

        // -- glue front and back parts together --
        ArrayList<Transaction> finalNewPlans = new ArrayList<Transaction>();
        for ( Transaction newTail : eligibleNewPlans ) {
          Transaction[] leg2 = new Transaction[1];
          leg2[0] = newTail;
          oldPartialPlan.setNext(leg2);
          Transaction newTxn = (Transaction) headOldPartialPlan.fclone();
          newTxn.setId(UUID.randomUUID().toString());
          newTxn.addLineItems(addPreviousFX(tq.getPartialTransaction()));
          finalNewPlans.add(newTxn);
        }

        // -- FillQuote --

        tq.setPlan(null);
        Transaction[] ts = (Transaction[]) finalNewPlans.toArray( new Transaction[0] );
        tq.setPlan(ts[0]);
        tq.setPlans(ts);
        return getDelegate().put_(x, tq);
      `
    },
    {
      name: 'addPreviousFX',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'net.nanopay.tx.TransactionLineItem[]',
      documentation: 'Create an info line item for the difference in fees between old and new txns',
      javaCode: `
        if ( ! (txn instanceof SummarizingTransaction) )
          throw new TransactionException("unable to properly update new fx line item");
        TransactionLineItem[] oldTli = txn.getLineItems();
        for (TransactionLineItem tli : oldTli) {
          if (tli instanceof FxSummaryTransactionLineItem) {
            tli.setName("actual new fx line item");
            TransactionLineItem[] tlis = new TransactionLineItem[1];
            tlis[0] = tli;
            return tlis;
          }
        }
        return null;
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
        if ( (txn != null) && (txn instanceof SummarizingTransaction) ) {
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
