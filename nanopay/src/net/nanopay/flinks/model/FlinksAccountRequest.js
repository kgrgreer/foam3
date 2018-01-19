foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountRequest',
  extends: 'net.nanopay.flinks.model.FlinksTransactionRequest',
  abstract: 'true',

  documentation: 'model for Flinks Transaction',

  properties: [
    {
      class: 'Boolean',
      name: 'WithBalance'
    },
    {
      class: 'Boolean',
      name: 'WithTransactions'
    }
  ]
});