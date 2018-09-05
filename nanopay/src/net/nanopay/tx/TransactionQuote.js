foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuote',

  documentation: `Select the best Plan and discard the remainder.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      documentation: `Request quote on behalf of this transaction.`,
      name: 'requestTransaction',
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.model.Transaction',
      javaReturns: 'net.nanopay.tx.model.Transaction',
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.TransactionPlan',
      name: 'plans'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.TransactionPlan',
      name: 'plan'
    }
  ]
});
