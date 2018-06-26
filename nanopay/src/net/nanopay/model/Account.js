foam.CLASS({
  package: 'net.nanopay.model',
  name: 'Account',
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
      class: 'String',
      name: 'currencyCode',
      value: 'CAD'
    }
  ]
});
