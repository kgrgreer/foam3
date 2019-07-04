// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "LineItemTax1",
	documentation: "Amount of money due to the government or tax authority, according to various pre-defined parameters such as thresholds or income.",
	properties: [
		{
			class: "FObjectArray",
			name: "CalculatedAmount",
			shortName: "ClctdAmt",
			documentation: "Amount of money resulting from the calculation of the tax.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TypeCode",
			shortName: "TpCd",
			documentation: "Type of tax applied.",
			of: "net.nanopay.iso20022.TaxTypeFormat1Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "TaxPointDate",
			shortName: "TaxPtDt",
			documentation: "Date of the tax point date when this tax, levy or duty becomes applicable.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PercentageRate",
			name: "CalculatedRate",
			shortName: "ClctdRate",
			documentation: "Rate used to calculate the amount of this tax, levy or duty.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max4Text",
			name: "CategoryCode",
			shortName: "CtgyCd",
			documentation: "Code specifying the category to which this tax, levy or duty applies, such as codes for 'exempt from tax', 'standard rate', \"free export item - tax not charged'.",
			required: false
		},
		{
			class: "StringArray",
			name: "CategoryName",
			shortName: "CtgyNm",
			documentation: "Category name, expressed as text, of the tax, levy or duty.",
			required: false
		}
	]
});