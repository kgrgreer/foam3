foam.CLASS({
  package: 'net.nanopay.account',
  name: 'CurrentBalance',
  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'balance'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'currencyCode',
      value: 'CAD'
    }
  ]
});
