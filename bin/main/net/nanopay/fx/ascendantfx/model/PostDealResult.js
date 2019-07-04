// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "PostDealResult",
	properties: [
		{
			class: "foam.core.Int",
			name: "DealPostCallID",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Deals",
			of: "net.nanopay.fx.ascendantfx.model.DealDetails"
		},
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
			class: "foam.core.Int",
			name: "NumberOfDeals",
			required: false
		}
	]
});