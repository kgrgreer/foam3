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
      of: 'net.nanopay.common.model.AccountLimit',
      name: 'limit'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.common.model.AccountInfo',
      name: 'accountInfo'
    }
  ]
});
