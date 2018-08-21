foam.CLASS({
  package: 'net.nanopay.fx',
  name: 'ConfirmFXDeal',

  documentation: 'API to Confirm status of FX Deal',

  properties: [
    {
      class: 'String',
      name: 'id',
      documentation: 'Refers to the Deal ID'
    },
    {
      class: 'String',
      name: 'fxPaymentId'
    }
  ]
});
