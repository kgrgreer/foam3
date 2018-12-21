foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'BalanceModel',

  documentation: 'model for Flinks account balance',

  properties: [
    {
      class: 'Double',
      name: 'Available'
    },
    {
      class: 'Double',
      name: 'Current'
    },
    {
      class: 'Double',
      name: 'Limit'
    }
  ]
});