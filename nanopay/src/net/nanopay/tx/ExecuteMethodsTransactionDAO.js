
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ExecuteMethodsTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorator calls two methods on transaction:
  executeBeforePut() - for additional logic on each transaction that needs to be executed before transaction is written to journals,
  executeAfterPut() - for additional logic that needs to be executed after transaction was written to journals.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.pm.PM',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'obj',
          type: 'foam.core.FObject'
        }
      ],
      type: 'foam.core.FObject',
      javaCode: `
    Transaction transaction = (Transaction) obj;
    Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(obj);
    PM pm = PM.create(x, obj, "executeBeforePut");
    try {
      transaction = transaction.executeBeforePut(x, oldTxn);
    } finally {
      pm.log(x);
    }
    Transaction returnTxn = (Transaction) getDelegate().put_(x, transaction);
    pm = PM.create(x, obj, "executeAfterPut");
    try {
      returnTxn.executeAfterPut(x, oldTxn);
    } finally {
      pm.log(x);
    }

    return returnTxn;
    `
    },
  ]
});
