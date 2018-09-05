foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionQuotes',
  extends: 'net.nanopay.tx.TransactionQuote',

  documentation: `Return all Plans to allow caller to choose.`,

  javaImports: [
    'net.nanopay.tx.model.Transaction'
  ]
});
