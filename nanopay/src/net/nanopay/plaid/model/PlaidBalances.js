foam.CLASS({
  package: 'net.nanopay.plaid.model',
  name: 'PlaidBalances',

  properties: [
    {
      class: 'Double',
      name: 'available'
    },
    {
      class: 'Double',
      name: 'current'
    },
    {
      class: 'Double',
      name: 'limit'
    },
    {
      class: 'String',
      name: 'isoCurrencyCode'
    },
    {
      class: 'Map',
      name: 'unofficialCurrencyCode'
    }
  ]
});
