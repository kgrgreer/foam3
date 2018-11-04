foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SaveChainedTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Saves chained transaction to journals.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
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
      Boolean nu = "".equals(((Transaction) obj).getId());

      Transaction txn = (Transaction) getDelegate().put_(x, obj);
      if ( ! nu ) return txn;
      Transaction tx = txn.getNext();
      Transaction prevTxn = txn;
      if ( tx != null ) {
        tx.setParent(prevTxn.getId());
        ((DAO) x.get("localTransactionDAO")).put_(x, tx);
      }
      return txn;
      `
    }
  ],

     axioms: [
       {
         buildJavaClass: function(cls) {
           cls.extras.push(`
   public SaveChainedTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
     System.err.println("Direct constructor use is deprecated. Use Builder instead.");
     setDelegate(delegate);
   }
           `);
         },
       },
     ]
});
