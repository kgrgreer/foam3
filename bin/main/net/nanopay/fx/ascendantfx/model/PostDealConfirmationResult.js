// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "PostDealConfirmationResult",
	properties: [
		{
			class: "foam.core.String",
			name: "AFXDealID"
		},
		{
			class: "foam.core.String",
			name: "AFXPaymentID"
		},
		{
			class: "foam.core.Int",
			name: "DealPostCallID",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "DealPostConfirm",
			of: "net.nanopay.fx.ascendantfx.model.DealPostConfirm",
			required: false
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
			class: "foam.core.String",
			name: "OrgID"
		}
	]
});