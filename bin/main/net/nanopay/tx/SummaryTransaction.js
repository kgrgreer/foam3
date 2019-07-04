foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'SummaryTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  documentation: 'Used solely to present a summary of LineItems for chained Transactions',

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
    },
  ]
});
