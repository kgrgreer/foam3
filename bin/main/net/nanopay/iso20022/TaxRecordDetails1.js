// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxRecordDetails1",
	documentation: "Provides information on the individual tax amount(s) per period of the tax record.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Period",
			shortName: "Prd",
			documentation: "Set of elements used to provide details on the period of time related to the tax payment.",
			of: "net.nanopay.iso20022.TaxPeriod1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Amount",
			shortName: "Amt",
			documentation: "Underlying tax amount related to the specified period.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		}
	]
});