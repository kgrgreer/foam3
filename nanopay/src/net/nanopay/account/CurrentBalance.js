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
      name: 'balance',
      documentation: 'Balance associated & gathered' +
          ' from transactions related to account.'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.model.Currency',
      name: 'currencyCode',
      documentation: 'Currency associated to account.',
      value: 'CAD'
    }
  ]
});
