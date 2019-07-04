// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.kotak.model.paymentResponse",
	name: "InstrumentType",
	properties: [
		{
			class: "net.nanopay.kotak.model.paymentResponse.MinChar1_MaxChar20_ST",
			name: "InstRefNo",
			required: false
		},
		{
			class: "net.nanopay.kotak.model.paymentResponse.MinChar1_MaxChar10_ST",
			name: "InstStatusCd",
			required: false
		},
		{
			class: "net.nanopay.kotak.model.paymentResponse.MinChar1_MaxChar2000_ST",
			name: "InstStatusRem",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ErrorList",
			of: "net.nanopay.kotak.model.paymentResponse.ErrorListType",
			required: false
		}
	]
});