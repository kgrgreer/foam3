foam.CLASS({
	package: "net.nanopay.fx.model",
	name: "FXQuote",
	properties: [
		{
			class: "foam.core.Date",
			name: "expiryTime"
		},
		{
			class: "String",
			name: "quoteId"
		},
		{
			class: "foam.core.Date",
			name: "quoteDateTime"
		},
    {
      class: "String",
      name: "status"
    },
	]
});
