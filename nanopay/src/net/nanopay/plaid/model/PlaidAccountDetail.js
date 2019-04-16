foam.CLASS({
  package: 'net.nanopay.plaid.model',
  name: 'PlaidAccountDetail',

  ids: ['userId', 'institutionId', 'name', 'mask'],

  properties: [
    {
      class: 'Long',
      name: 'userId',
      hidden: true
    },
    {
      class: 'String',
      name: 'itemId',
      hidden: true
    },
    {
      class: 'String',
      name: 'institutionName',
    },
    {
      class: 'String',
      name: 'institutionId',
      hidden: true
    },
    {
      class: 'String',
      name: 'accountId'
    },
    {
      class: 'String',
      name: 'mask',
      hidden: true
    },
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'officialName'
    },
    {
      class: 'String',
      name: 'subtype',
      hidden: true
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.PlaidBalances',
      name: 'balance'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.ACH',
      name: 'ACH'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.plaid.model.EFT',
      name: 'EFT',
      hidden: true
    }
  ]
});
