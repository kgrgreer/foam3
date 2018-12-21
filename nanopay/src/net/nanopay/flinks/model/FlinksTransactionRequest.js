foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksTransactionRequest',
  extends: 'net.nanopay.flinks.model.FlinksRequest',
  abstract: 'true',

  documentation: 'model for Flinks account request',

  properties: [
    {
      class: 'Boolean',
      name: 'MostRecent'
    },
    {
      class: 'Boolean',
      name: 'MostRecentCached'
    }
  ]
});