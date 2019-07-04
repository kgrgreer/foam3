// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "PayeeInfoValidationResult",
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
			class: "foam.core.Int",
			name: "NumberOfInValidPayees",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "NumberOfPayees",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "NumberOfValidPayees",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ValidationDetail",
			of: "net.nanopay.fx.ascendantfx.model.ValidationDetails"
		}
	]
});