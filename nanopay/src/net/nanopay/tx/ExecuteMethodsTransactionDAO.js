
foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ExecuteMethodsTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: ``,

  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.tx.model.Transaction'
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
    Transaction transaction = (Transaction) obj;
    Transaction oldTxn = (Transaction) ((DAO) x.get("localTransactionDAO")).find(((Transaction)obj).getId());
    transaction = transaction.executeBefore(x, oldTxn);
    Transaction returnTxn = (Transaction) getDelegate().put_(x, transaction);
    returnTxn.executeAfter(x, oldTxn);
    return returnTxn;
    `
    },
  ]
});
