// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "GetAccountBalanceResult",
	properties: [
		{
			class: "FObjectArray",
			name: "Account",
			of: "net.nanopay.fx.ascendantfx.model.AccountDetails"
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
			name: "NumberOfAccount"
		}
	]
});