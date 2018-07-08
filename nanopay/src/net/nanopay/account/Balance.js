foam.CLASS({
  package: 'net.nanopay.account',
  name: 'Balance',

  ids: [ 'accountId', 'currencyCode' ],

  properties: [
    {
      class: 'Long',
      name: 'accountId'
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
