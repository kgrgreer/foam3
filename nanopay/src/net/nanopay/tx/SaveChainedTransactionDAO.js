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
      javaCode: `
      Boolean nu = "".equals(((Transaction) obj).getId());

      Transaction txn = (Transaction)obj;
      Transaction next = txn.getNext();
      if ( next != null ) {
        txn.setNext(null);
      }
      txn = (Transaction) getDelegate().put_(x, txn);
      if ( next != null ) {
        next.setParent(txn.getId());
        ((DAO) x.get("localTransactionDAO")).put_(x, next);
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
