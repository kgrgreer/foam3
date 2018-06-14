foam.CLASS({
  package: 'net.nanopay.model',
  name: 'MultiBalance',
  properties: [
    {
      class: 'Long',
      name: 'userId'
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
