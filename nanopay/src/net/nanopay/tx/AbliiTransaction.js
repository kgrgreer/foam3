foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'AbliiTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  documentation: `Transaction to be created specifically for ablii users, enforces source/destination to always be bank accounts`,

  javaImports: [
    'foam.dao.DAO',
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
      DAO invoiceDAO = (DAO) x.get("invoiceDAO");
      if( invoiceDAO.find(tx.getInvoiceId()) == null ) {
        throw new RuntimeException("No invoice was provided for this transaction.");
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
