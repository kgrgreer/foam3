foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Account',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.model.AccountLimit',
      name: 'limit'
    },
    {
      class: 'Long',
      name: 'balance'
    }
  ]
});
