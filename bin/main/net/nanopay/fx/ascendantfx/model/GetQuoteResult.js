// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "GetQuoteResult",
	properties: [
		{
			class: "foam.core.Long",
			name: "ErrorCode",
			required: false
		},
		{
			class: "foam.core.String",
			name: "ErrorMessage"
		},
		{
			class: "FObjectArray",
			name: "Payment",
			of: "net.nanopay.fx.ascendantfx.model.Deal"
		},
		{
			class: "FObjectProperty",
			name: "Quote",
			of: "net.nanopay.fx.ascendantfx.model.Quote"
		},
		{
			class: "foam.core.Int",
			name: "TotalNumberOfPayment",
			required: false
		}
	]
});