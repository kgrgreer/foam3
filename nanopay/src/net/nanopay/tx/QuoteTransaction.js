foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'QuoteTransaction',
  extends: 'net.nanopay.tx.CompositeTransaction',

  documentation: `Select the best Plan and discard the remainder.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ]
});
