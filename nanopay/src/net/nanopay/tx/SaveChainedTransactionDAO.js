/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
        Transaction initialTxn = (Transaction) getDelegate().put_(x, obj);
        DAO txnDAO = (DAO) x.get("localTransactionDAO");
        Transaction txn = initialTxn;
        Transaction tx = initialTxn.getPrev();
        while ( tx != null ) {
          tx.setIsQuoted(true);
          txn.setIsQuoted(true);
          tx = (Transaction) txnDAO.put_(x, tx);
          tx.getChildren(x).put(txn);
          txn = tx;
          tx = tx.getPrev();
        }
        DAO txDAO = initialTxn.getChildren(x);
        tx = initialTxn.getNext();
        txn = initialTxn;
        while ( tx != null ) {
          tx.setIsQuoted(true);
          tx.setParent(txn.getId());
          tx = (Transaction) txnDAO.put_(x, tx);
          tx = tx.getNext();
        }
        return initialTxn;
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
