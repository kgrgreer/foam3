// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.kotak.model",
	name: "InstrumentType",
	properties: [
		{
			class: "net.nanopay.fx.kotak.model.MinChar1_MaxChar20_ST",
			name: "InstRefNo",
			required: false
		},
		{
			class: "net.nanopay.fx.kotak.model.MinChar1_MaxChar10_ST",
			name: "InstStatusCd",
			required: false
		},
		{
			class: "net.nanopay.fx.kotak.model.MinChar1_MaxChar2000_ST",
			name: "InstStatusRem",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ErrorList",
			of: "net.nanopay.fx.kotak.model.ErrorListType",
			required: false
		}
	]
});