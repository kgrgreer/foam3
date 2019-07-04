// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "SubmitIncomingDealResult",
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
			name: "InstructionToSender",
			of: "net.nanopay.fx.ascendantfx.model.InstructionToSender"
		},
		{
			class: "foam.core.String",
			name: "OrgID"
		},
		{
			class: "FObjectArray",
			name: "PaymentDetail",
			of: "net.nanopay.fx.ascendantfx.model.SubmitIncomingDealDetail"
		},
		{
			class: "foam.core.Int",
			name: "TotalPayment",
			required: false
		}
	]
});