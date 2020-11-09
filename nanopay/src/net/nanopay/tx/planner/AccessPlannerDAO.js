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
  name: 'AccessPlannerDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'controls interaction with the plannerDAO service',

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.SummaryTransaction',
    'net.nanopay.fx.FXSummaryTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.planner.AbstractTransactionPlanner',
    'net.nanopay.tx.planner.TransactionPlan',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.TransactionException',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.tx.UnsupportedTransactionException'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        if ( obj != null ) {
          Transaction t = null;
          if ( obj instanceof TransactionQuote && ((TransactionQuote) obj).getRequestTransaction() != null) {
            TransactionQuote tq = (TransactionQuote) obj;
            if (SafetyUtil.isEmpty(tq.getRequestTransaction().getId())) {
              tq.setPlan(null);
              tq.setPlans(new Transaction [0]);
              return getDelegate().put_(x, tq);
            }
            t = tq.getRequestTransaction();
          }
          if ( obj instanceof Transaction )
            t = (Transaction) obj;

          if (t != null) {
            // if transaction has been planned already, just load it.
            if ( ! SafetyUtil.isEmpty(t.getId()) )
              return loadPlan(x, t);
            // otherwise make a new clean quote.
            t.setNext(null);
            TransactionQuote tq = new TransactionQuote();
            tq.setRequestTransaction(t);
            return getDelegate().put_(x, tq);
          }
        }
        throw new UnsupportedTransactionException("Error, Only transaction or TransactionQuote objects can be put to the TransactionPlannerDAO");
      `
    },
    {
      name: 'loadPlan',
      type: 'net.nanopay.tx.model.Transaction',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        //find the plan
        TransactionPlan plannedTx = (TransactionPlan) getDelegate().find_(x, txn.getId());
        if ( plannedTx == null ) {
          ((Logger) x.get("logger")).warning(this.getClass().getSimpleName(), "Plan Not Found", txn.getId());
          throw new PlanNotFoundException(txn.getId());
        }

          /*
        if ( Transaction instanceof Capable )
          //TODO: do capability checks to see if user filled them all out, if not return to user to get capabilities first.
          We will skip this for now because statuses are not done. doing nothing will
          */

        try {
          validate_(x, plannedTx.getTransaction());
        } catch(foam.core.ValidationException e) {
          Logger logger = (Logger) x.get("logger");
          logger.warning("Transaction Plan Validation Failed. \\ntxn:", txn, "\\nplan:", plannedTx);
          throw e;
        }

        //remove the plan
        getDelegate().remove_(x, plannedTx);

        return (Transaction) plannedTx.getTransaction().fclone();
      `
    },
    {
      name: 'replaceLineItem_',
      args: [
        { name: 'line', type: 'net.nanopay.tx.TransactionLineItem'},
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction'}
      ],
      documentation: 'replace a lineItem on the transaction with an updated line item.',
      javaCode: `
        if ( txn == null ) {
          return;
        }
        TransactionLineItem[] tlis = txn.getLineItems();
        for ( int i =0; i < tlis.length; i++ ) {
          if (line.getId().equals(tlis[i].getId())) {
            tlis[i] = line;
            break;
          }
        }
        txn.setLineItems(tlis);
      `
    },
    {
    name: 'validate_',
    args: [
      { name: 'x', type: 'Context' },
      { name: 'txn', type: 'net.nanopay.tx.model.Transaction'}
    ],
    documentation: 'recursive tree validation: 1. Validate Transaction 2. Validate against transactions Planner 3. validate transaction line Items ',
    javaCode: `
      // --- Transaction Validation ---
      txn.validate(x);

      // --- Planner Validation ---
      AbstractTransactionPlanner atp = (AbstractTransactionPlanner) txn.findPlanner(x);
      if (atp == null || ! atp.validatePlan(x, txn)) {
        Logger logger = (Logger) x.get("logger");
        logger.warning(txn.getId() + " failed planner validation");
        throw new RuntimeException(" Planner Validation failed"); // return txn to user on failure
      }

      // --- Line Item Validation ---
      for ( TransactionLineItem li : txn.getLineItems() )
        li.validate();

      if ( txn.getNext() != null || txn.getNext().length == 0 ) {
        Transaction [] txs = txn.getNext();
        for ( Transaction tx : txs ) {
          validate_(x, tx);
        }
      }

      txn.setIsValid(true);
    `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AccessPlannerDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
