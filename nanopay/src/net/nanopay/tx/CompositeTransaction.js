foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CompositeTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
      name: 'addNext',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        Transaction tx = this;
        Transaction [] t = tx.getNext();
        txn.setInitialStatus(txn.getStatus());
        txn.setStatus(TransactionStatus.PENDING_PARENT_COMPLETED);
        if ( t == null ) {
          return;
        }
        int size = t.length;
        Transaction [] t2 = new Transaction [size+1];
        for ( int i = 0; i < tx.getNext().length; i++ ) {
          t2[i] = t[i];
        }
        t2[t2.length-1] = txn;
        tx.setNext(t2);
      `
    }
  ]
})
