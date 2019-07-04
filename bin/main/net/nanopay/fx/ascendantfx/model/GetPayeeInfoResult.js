// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "GetPayeeInfoResult",
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
			class: "foam.core.String",
			name: "NumberOfPayees"
		},
		{
			class: "FObjectArray",
			name: "PayeeDetail",
			of: "net.nanopay.fx.ascendantfx.model.PayeeDetail"
		}
	]
});