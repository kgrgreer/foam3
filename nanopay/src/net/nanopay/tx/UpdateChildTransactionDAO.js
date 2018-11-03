foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'UpdateChildTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Updates child transaction`,

  javaImports: [
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.dao.ArraySink',
    'foam.nanos.auth.User',
    'java.util.List',
    'net.nanopay.tx.model.TransactionStatus',
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
      Transaction oldTxn = (Transaction) getDelegate().find_(x, obj);
          Transaction txn = (Transaction) getDelegate().put_(x, obj);
          List children = ((ArraySink) txn.getChildren(x).select(new ArraySink())).getArray();
          if ( children.size() == 0 ) return txn;
          if ( oldTxn.getStatus() != TransactionStatus.COMPLETED && txn.getStatus() == TransactionStatus.COMPLETED ) {
            for ( Object txObj : children ) {
              Transaction t = (Transaction)((FObject) txObj).fclone();
              ((DAO) x.get("localTransactionDAO")).put_(x, t);
            }
          }
      return txn;
      `
    }
  ],

     axioms: [
       {
         buildJavaClass: function(cls) {
           cls.extras.push(`
   public UpdateChildTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
     System.err.println("Direct constructor use is deprecated. Use Builder instead.");
     setDelegate(delegate);
   }
           `);
         },
       },
     ]
});
