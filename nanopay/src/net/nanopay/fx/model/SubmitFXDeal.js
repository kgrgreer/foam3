foam.CLASS({
  package: 'net.nanopay.fx.model',
  name: 'SubmitFXDeal',

  documentation: 'API to Submit FX Deals for Payment',

  properties: [
    {
      class: 'String',
      name: 'quoteId'
    },
    {
			class: "FObjectProperty",
			name: "fxDeal",
			of: "net.nanopay.fx.model.FXDeal"
		},
    {
      class: "foam.core.String",
      name: "notesToPayee"
    },
    {
      class: "foam.core.String",
      name: "paymentMethod"
    },
    {
      class: "foam.core.Int",
      name: "TotalNumberOfPayment",
      required: false
    }
  ]
});
