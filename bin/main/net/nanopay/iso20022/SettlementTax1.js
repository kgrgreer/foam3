// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "SettlementTax1",
	documentation: "Species the tax applicable for this settlement.",
	properties: [
		{
			class: "FObjectProperty",
			name: "TypeCode",
			shortName: "TpCd",
			documentation: "Type of tax applied.",
			of: "net.nanopay.iso20022.TaxTypeFormat1Choice",
			required: false
		},
		{
			class: "FObjectArray",
			name: "CalculatedAmount",
			shortName: "ClctdAmt",
			documentation: "Monetary value resulting from the calculation of this tax, levy or duty.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "BasisAmount",
			shortName: "BsisAmt",
			documentation: "Monetary value used as the basis on which this tax, levy or duty is calculated.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "TaxPointDate",
			shortName: "TaxPtDt",
			documentation: "Date of the tax point when this tax, levy or duty becomes applicable.",
			required: false
		}
	]
});