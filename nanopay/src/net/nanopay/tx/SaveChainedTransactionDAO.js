/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SaveChainedTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Saves chained transaction to journals.`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.SummarizingTransaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Transaction txn = (Transaction)obj;
        Transaction [] next = txn.getNext();

        if ( next == null || next.length == 0 ) {
          return getDelegate().put_(x, txn);
        }
        // If summary txn is root make it pending for the chain save.
        if ( txn instanceof SummarizingTransaction && txn.getStatus() != TransactionStatus.PENDING_PARENT_COMPLETED)
          txn.setStatus(TransactionStatus.PENDING);

        // Nullify next and save self
        txn.setNext(null);
        txn = (Transaction) getDelegate().put_(x, txn);

        // Save chain
        for ( Transaction nextTransaction : next ) {
          if ( ((DAO) x.get("localTransactionDAO")).find(nextTransaction.getId()) != null ) {
            checkAndSaveNextTransaction(x, nextTransaction, txn);
          } else {
            nextTransaction.setParent(txn.getId());
            ((DAO) x.get("localTransactionDAO")).put_(x, nextTransaction);
          }
        }

        // Save summary as completed once chain fully saved. but only if its not somewhere within a chain.
        if ( txn instanceof SummarizingTransaction && txn.getStatus().equals(TransactionStatus.PENDING) ) {
          txn = (Transaction) txn.fclone();

          // Auto complete summaryTransactions without an invoice
          if ( txn.getInvoiceId() == 0 ) {
            txn.setStatus(TransactionStatus.COMPLETED);
          }
          
          return getDelegate().put_(x, txn);
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
            checkAndSaveNextTransaction(x, txn, txn);
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
