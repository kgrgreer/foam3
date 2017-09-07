foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'Account',
  properties: [
    {
      class: 'Long',
      name: 'id'
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
