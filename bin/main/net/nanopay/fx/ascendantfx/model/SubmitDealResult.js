// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "SubmitDealResult",
	properties: [
		{
			class: "foam.core.String",
			name: "DealID"
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
			class: "FObjectArray",
			name: "PaymentDetail",
			of: "net.nanopay.fx.ascendantfx.model.DealDetail"
		},
		{
			class: "foam.core.Int",
			name: "TotalNumberOfPayment",
			required: false
		}
	]
});