// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "PostDealConfirmationRequest",
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
			class: "foam.core.String",
			name: "MethodID"
		},
		{
			class: "foam.core.String",
			name: "OrgID"
		}
	]
});