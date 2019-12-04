foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'FXSummaryTransaction',
  extends: 'net.nanopay.fx.FXTransaction',

  documentation: `Transaction used as a summary to for AFEX BMO transactions`,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.notification.Notification',
    'foam.util.SafetyUtil',
    'net.nanopay.invoice.model.Invoice',
    'foam.core.Currency',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  methods: [
    {
     documentation: `return true when status change is such that normal (forward) Transfers should be executed (applied)`,
     name: 'canTransfer',
     args: [
       {
         name: 'x',
         type: 'Context'
       },
       {
         name: 'oldTxn',
         type: 'net.nanopay.tx.model.Transaction'
       }
     ],
     type: 'Boolean',
     javaCode: `
       return false;
     `
   },
   {
     documentation: `return true when status change is such that reveral Transfers should be executed (applied)`,
     name: 'canReverseTransfer',
     args: [
       {
         name: 'x',
         type: 'Context'
       },
       {
         name: 'oldTxn',
         type: 'net.nanopay.tx.model.Transaction'
       }
     ],
     type: 'Boolean',
     javaCode: `
       return false;
     `
   },
   {
    documentation: `Collect all line items of succeeding transactions of self.`,
    name: 'collectLineItems',
    javaCode: `
    collectLineItemsFromChain(getNext());
    `
  },
  {
    documentation: `Collect all line items of succeeding transactions of transactions.`,
    name: 'collectLineItemsFromChain',
    args: [
      {
        name: 'transactions',
        type: 'net.nanopay.tx.model.Transaction[]'
      }
    ],
    javaCode: `
    if ( transactions != null ) {
      for ( Transaction transaction : transactions ) {
        addLineItems(transaction.getLineItems(), transaction.getReverseLineItems());
        collectLineItemsFromChain(transaction.getNext());
      }
    }
    `
  }
 ]

});
