// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "GetAccountActivityResult",
	properties: [
		{
			class: "foam.core.String",
			name: "AccountNumber"
		},
		{
			class: "foam.core.Double",
			name: "ClosingBalance",
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
			class: "foam.core.Int",
			name: "Factor",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "Month",
			required: false
		},
		{
			class: "foam.core.Int",
			name: "NumberOfTransaction",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "OpeningBalance",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Transaction",
			of: "net.nanopay.fx.ascendantfx.model.TransactionDetails"
		},
		{
			class: "foam.core.Int",
			name: "Year",
			required: false
		}
	]
});