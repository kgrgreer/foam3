// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "SettlementSubTotalCalculatedTax1",
	documentation: "Specifies the subtotal calculated tax applicable for this settlement.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max4Text",
			name: "TypeCode",
			shortName: "TpCd",
			documentation: "Type of tax applied.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max4Text",
			name: "CategoryCode",
			shortName: "CtgyCd",
			documentation: "Reference used to identify the nature of tax levied, such as Value Added Tax (VAT).",
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
			class: "net.nanopay.iso20022.PercentageRate",
			name: "CalculatedRate",
			shortName: "ClctdRate",
			documentation: "Rate used to calculate the amount of this tax, levy or duty.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ExemptionReason",
			shortName: "XmptnRsn",
			documentation: "Reason for a tax exemption.",
			of: "net.nanopay.iso20022.TaxExemptionReason1",
			required: false
		}
	]
});