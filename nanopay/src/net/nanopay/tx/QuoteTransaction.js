foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'QuoteTransaction',
  extends: 'net.nanopay.tx.CompositeTransaction',

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
      factory: function() {
        return this;
      },
      javaReturns: 'net.nanopay.tx.model.Transaction',
      javaFactory: `
        return this;
`
    }
  ]
});
