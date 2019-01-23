foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'AbliiTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Transaction to be created specifically for ablii users, enforces source/destination to always be bank accounts`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'executeBeforePut',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaReturns: 'Transaction',
      javaCode: `
      Transaction tx = super.executeBeforePut(x, oldTxn);

      // An invoice is required to create an ablii transaction
      if( tx.findInvoiceId(x) == null ) {
        throw new RuntimeException("An invoice for this transaction was not provided.");
      }

      if ( oldTxn == null ) {
        Transaction nxtTx = tx.getNext();
        while(nxtTx != null) {
          nxtTx.setInvoiceId(tx.getInvoiceId());
          nxtTx = nxtTx.getNext();
        }
      }
      return tx;
    `
    }
  ]
});
