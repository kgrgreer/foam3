foam.CLASS({
  package: 'net.nanopay.common.model',
  name: 'Account',
  properties: [
    {
      class: 'FObjectProperty',
      of:    'Limit',
      name:  'limit'
    },
    {
      class: 'FObjectProperty',
      of: 'AccountInfo',
      name: 'accountInfo'
    },
  ]
});
