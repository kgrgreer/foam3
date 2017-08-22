foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'Account',
  ids: [ 'accountId' ],
  properties: [
    {
      class: 'String',
      name: 'accountId'
    },
    {
      class: 'FObjectProperty',
      of:    'AccountLimit',
      name:  'limit'
    },
    {
      class: 'FObjectProperty',
      of: 'AccountInfo',
      name: 'accountInfo'
    },
  ]
});
