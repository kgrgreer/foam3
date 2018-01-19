foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountsSummaryResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks accounts summary response',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountModel',
      name: 'Accounts'
    },
    {
      class: 'String',
      name: 'Institution'
    }
  ]
});