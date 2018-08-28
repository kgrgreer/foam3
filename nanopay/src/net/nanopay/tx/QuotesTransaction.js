foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'QuotesTransaction',
  extends: 'net.nanopay.tx.QuoteTransaction',

  documentation: `Return all Plans to allow caller to choose.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ]
});
