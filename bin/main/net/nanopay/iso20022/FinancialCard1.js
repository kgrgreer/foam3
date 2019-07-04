// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "FinancialCard1",
	documentation: "Card used to represent a financial account for the purpose of payment settlement.",
	properties: [
		{
			class: "FObjectArray",
			name: "CreditLimitAmount",
			shortName: "CdtLmtAmt",
			documentation: "Monetary value of the credit limit for this financial card.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "CreditAvailableAmount",
			shortName: "CdtAvlblAmt",
			documentation: "Monetary value of the credit available for this financial card.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PercentageRate",
			name: "InterestRatePercent",
			shortName: "IntrstRatePct",
			documentation: "Interest rate expressed as a percentage for this financial card.",
			required: false
		}
	]
});