foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'AbstractTransactionPlanner',
  abstract: true,

  documentation: 'Abstract rule action for transaction planning.',

  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  javaImports: [
    'foam.dao.DAO',
    'java.util.UUID',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.tx.Transfer',
    'static foam.mlang.MLang.EQ',
    'net.nanopay.tx.TransactionQuote',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
  /*
  //these will likely be needed for calculating "best plan"
    {
      class: 'Long',
      name: 'transactionTime',
      value: 0
    },
    {
      class: 'Long',
      name: 'fee',
      value: 0
    },
    */
    {
      name: 'myTransfers_',
      class: 'List',
      javaFactory: 'return new ArrayList<Transfer>();'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      documentation: 'applyAction of the rule is called by rule engine',
      javaCode: `
        TransactionQuote q = (TransactionQuote) obj;
        Transaction t = q.getRequestTransaction();
        savePlan(plannerLogic(x, q, ((Transaction) t.freeze()), agency), q); //this freeze will likely need to go at beginning of Planner stack instead.
      `
    },
    {
      name: 'plannerLogic',
      documentation: 'The transaction that is to be planned should be created here',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' },
        { name: 'requestTxn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'agency', type: 'foam.core.Agency' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        /* Needs to be overwritten by extending class */
        return new Transaction();
      `
    },
    {
      name: 'addTransfer',
      documentation: 'helper function for adding transfers to Transaction',
      args: [
        { name: 'account', type: 'Long' },
        { name: 'amount', type: 'Long' }
      ],
      javaCode: `
        Transfer t = new Transfer();
        t.setAccount(account);
        t.setAmount(amount);
        getMyTransfers_().add(t);
      `
    },
    {
      name: 'savePlan',
      documentation: 'boiler plate transaction fields that need to be set for a valid plan',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' },
        { name: 'quote', type: 'net.nanopay.tx.TransactionQuote' }
      ],
      javaCode: `
        txn.setId(UUID.randomUUID().toString());
        txn.setTransfers((Transfer[]) getMyTransfers_().toArray(new Transfer[0]));
        txn.setIsQuoted(true);
        //likely can add logic for setting clearing/completion time based on planners here.
        //auto add fx rate
        //TODO: add cost by hitting Fee Engine
        //TODO: hit tax engine
        //TODO: signing
        quote.addPlan(txn);
      `
    },
    {
      name: 'subPlan',
      documentation: 'Takes care of recursive transactionQuotePlanDAO calls',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        DAO d = (DAO) x.get("localTransactionQuotePlanDAO");
        TransactionQuote quote = new TransactionQuote();
        quote.setRequestTransaction(txn);
        quote = (TransactionQuote) d.put(quote);
        return quote.getPlan();
      `
    },
  ]
});

