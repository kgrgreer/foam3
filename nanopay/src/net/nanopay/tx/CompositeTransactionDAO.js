foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompositeTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
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
        Transaction txn = (Transaction) obj;
        Transaction old = (Transaction) getDelegate().find_(x, obj);
        if ( old != null && old.getStatus() != TransactionStatus.COMPLETED &&
             txn.getStatus() == TransactionStatus.COMPLETED ) {
           Transaction parent = txn.findParent(x);
           if ( parent != null && parent instanceof CompositeTransaction ) {
             ((CompositeTransaction)parent).next();
           } else {
             return getDelegate().put_(x, txn);
           }
        }
        return getDelegate().put_(x, txn);
      `
    },
  ]
});
