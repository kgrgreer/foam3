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
      Transaction [] next = txn.getNext();
      if ( next != null ) {
        txn.setNext(null);
      }
      txn = (Transaction) getDelegate().put_(x, txn);
      if ( next != null && next.length > 0 ) {
        for ( Transaction nextTransaction : next ) {
          if ( ((DAO) x.get("localTransactionDAO")).find(nextTransaction.getId()) != null ) {
            checkAndSaveNextTransaction(x, nextTransaction, txn);
          } else { 
            nextTransaction.setParent(txn.getId());
            ((DAO) x.get("localTransactionDAO")).put_(x, nextTransaction);
          }
        }
      }
      return txn;
      `
    },
    {
      name: 'checkAndSaveNextTransaction',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
        type: 'net.nanopay.tx.model.Transaction',
          name: 'transaction'
        },
        {
          type: 'net.nanopay.tx.model.Transaction',
          name: 'parent'
        },
      ],
      javaCode: `
        for ( Transaction txn: transaction.getNext() ) {
          Transaction existing = (Transaction) ((DAO) x.get("localTransactionDAO")).find(txn.getId());
          if ( existing != null ) {
            checkAndSaveNextTransaction(x,txn,txn);
          } else {
            txn.setParent(parent.getId());
            ((DAO) x.get("localTransactionDAO")).put_(x, txn);
          }
        }
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
