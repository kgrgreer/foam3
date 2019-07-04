// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "SettlementMonetarySummation1",
	documentation: "Specifies a collection of monetary totals for this settlement.",
	properties: [
		{
			class: "FObjectArray",
			name: "LineTotalAmount",
			shortName: "LineTtlAmt",
			documentation: "Monetary value of the line amount total being reported for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AllowanceTotalAmount",
			shortName: "AllwncTtlAmt",
			documentation: "Monetary value of the allowance total being reported for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TotalDiscountAmount",
			shortName: "TtlDscntAmt",
			documentation: "Monetary value of the total discount being reported for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ChargeTotalAmount",
			shortName: "ChrgTtlAmt",
			documentation: "Monetary value of the charge amount total being reported for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TotalPrepaidAmount",
			shortName: "TtlPrepdAmt",
			documentation: "Monetary value of the total prepaid amount being reported for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TaxTotalAmount",
			shortName: "TaxTtlAmt",
			documentation: "Monetary value of the total of all tax basis amounts being reported for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TaxBasisAmount",
			shortName: "TaxBsisAmt",
			documentation: "Monetary value of the total of all tax basis amounts being reported for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "RoundingAmount",
			shortName: "RndgAmt",
			documentation: "Monetary value of a rounding amount being applied and reported for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "GrandTotalAmount",
			shortName: "GrdTtlAmt",
			documentation: "Monetary value of the grand total being reported for this settlement, to include addition and subtraction of individual summation amounts.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "InformationAmount",
			shortName: "InfAmt",
			documentation: "Monetary value of an amount being reported as information for this settlement.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		}
	]
});