/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'QuoteTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Request a plan quote for a Transaction.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.CompositeTransaction',
    'net.nanopay.tx.PlanTransaction',
    'net.nanopay.tx.QuoteTransaction',
    'net.nanopay.tx.QuotesTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionType',

    'net.nanopay.tx.PlanCostComparator',
    'net.nanopay.tx.PlanETAComparator',
    'net.nanopay.tx.PlanTransactionComparator',
    'java.util.List',
    'java.util.ArrayList',
    'java.util.Collections'
  ],

  imports: [
    'localTransactionPlanDAO'
  ],

  properties: [
    {
      name: 'planDAO',
      class: 'foam.dao.DAOProperty',
      factory: function() {
        return this.localTransactionPlanDAO;
      },
      javaFactory: `
    return (DAO) this.getX().get("localTransactionPlanDAO");
`
    }
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'obj',
          of: 'foam.core.FObject'
        }
      ],
      javaReturns: 'foam.core.FObject',
      javaCode: `
    if ( ! ( obj instanceof QuoteTransaction ) ) {
      return super.put_(x, obj);
    }
    // NOTE: for requests such as RetailTransaction, it is
    // the responsibility of, perhaps a RetailTransactionDAO, to
    // initiate a Quote request.

    // If Transaction does not yet have a plan,
    // then request a quote.
    Transaction txn = (Transaction) obj;
    if ( txn.getPlan() != null ) {
      return super.put_(x, obj);
    }

    Logger logger = (Logger) x.get("logger");

    // Select best plan and set on Transaction.
    PlanTransaction plan = null;
    QuoteTransaction quote = (QuoteTransaction) getPlanDAO().put_(x, obj);
    if ( txn instanceof QuoteTransaction ||
         ! ( txn instanceof QuotesTransaction ) ) {
      // TODO: select best plan
      PlanCostComparator costComparator =  new PlanCostComparator.Builder(x).build();
      PlanETAComparator etaComparator =  new PlanETAComparator.Builder(x).build();
      PlanTransactionComparator planComparators = new PlanTransactionComparator.Builder(x).build();
      planComparators.add(costComparator); // Compare Cost first
      planComparators.add(etaComparator);
      List<PlanTransaction> planTransactions = new ArrayList<PlanTransaction>();
      for ( Transaction aTransaction : quote.transactions() ){
        if ( aTransaction instanceof PlanTransaction ) {
          planTransactions.add((PlanTransaction) aTransaction);
        }
      }
      Collections.sort(planTransactions, planComparators);
      if ( ! planTransactions.isEmpty() ) {
        plan = planTransactions.get(0);
      } else {
        // if no plan, then set to empty plan.
        plan = new PlanTransaction.Builder(x).build();
      }
      txn.setPlan(plan);
      plan.accept(x);
    }
    // QuotesTransaction - return all plans.

    return super.put_(x, txn);
`
    }
  ]
});
