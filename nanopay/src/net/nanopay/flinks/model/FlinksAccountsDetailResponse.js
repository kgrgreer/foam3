foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountsDetailResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks accounts detail response',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountWithDetailModel',
      name: 'Accounts'
    }
  ]
});