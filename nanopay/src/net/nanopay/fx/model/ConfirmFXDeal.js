foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'ConfirmFXDeal',

  documentation: 'API to Confirm status of FX Deal',

  properties: [
    {
      class: "foam.core.String",
      name: "fxDealId"
    },
    {
      class: "foam.core.String",
      name: "fxPaymentId"
    }
  ]
});
