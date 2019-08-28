foam.CLASS({
  package: 'net.nanopay.fx.afex',
  name: 'GetConfirmationPDFRequest',
  properties: [
    {
      class: 'String',
      name: 'clientAPIKey'
    },
    {
      class: 'String',
      name: 'tradeNumber'
    },
    {
      class: 'Boolean',
      name: 'swift'
    }
  ]
});
