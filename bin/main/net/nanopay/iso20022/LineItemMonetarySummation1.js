// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "LineItemMonetarySummation1",
	documentation: "Trade settlement monetary summation specified for this supply chain trade settlement.",
	properties: [
		{
			class: "FObjectArray",
			name: "LineTotalAmount",
			shortName: "LineTtlAmt",
			documentation: "Monetary value of the line amount total being reported in this trade settlement monetary summation.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AllowanceTotalAmount",
			shortName: "AllwncTtlAmt",
			documentation: "Monetary value of the total of all allowance amounts being reported in this line item monetary summation.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ChargeTotalAmount",
			shortName: "ChrgTtlAmt",
			documentation: "Monetary value of the total of all charge amounts being reported in this line item monetary summation.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TaxTotalAmount",
			shortName: "TaxTtlAmt",
			documentation: "Monetary value of the total of all tax amounts being reported in this line item monetary summation.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TaxBasisTotalAmount",
			shortName: "TaxBsisTtlAmt",
			documentation: "Monetary value of the total of all tax basis amounts being reported in this line item monetary summation.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "InformationAmount",
			shortName: "InfAmt",
			documentation: "Monetary value of an amount being reported for information in this line item monetary summation.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		}
	]
});