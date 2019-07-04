// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "GetQuoteRequest",
	properties: [
		{
			class: "foam.core.String",
			name: "MethodID"
		},
		{
			class: "foam.core.String",
			name: "OrgID"
		},
		{
			class: "FObjectArray",
			name: "Payment",
			of: "net.nanopay.fx.ascendantfx.model.Deal"
		},
		{
			class: "foam.core.Int",
			name: "TotalNumberOfPayment",
			required: false
		}
	]
});