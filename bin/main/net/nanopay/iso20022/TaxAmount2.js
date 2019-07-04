// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxAmount2",
	documentation: "Set of elements used to provide information on the tax amount(s) of tax record.",
	properties: [
		{
			class: "net.nanopay.iso20022.PercentageRate",
			name: "Rate",
			shortName: "Rate",
			documentation: "Rate used to calculate the tax.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TaxableBaseAmount",
			shortName: "TaxblBaseAmt",
			documentation: "Amount of money on which the tax is based.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TotalAmount",
			shortName: "TtlAmt",
			documentation: "Total amount that is the result of the calculation of the tax for the record.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Details",
			shortName: "Dtls",
			documentation: "Set of elements used to provide details on the tax period and amount.",
			of: "net.nanopay.iso20022.TaxRecordDetails2",
			required: false
		}
	]
});