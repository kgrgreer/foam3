// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "ValidationDetails",
	properties: [
		{
			class: "foam.core.Long",
			name: "ErrorCode",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ErrorDetail",
			of: "net.nanopay.fx.ascendantfx.model.ErrorDetails"
		},
		{
			class: "FObjectProperty",
			name: "PayeeDetail",
			of: "net.nanopay.fx.ascendantfx.model.PayeeDetail"
		}
	]
});