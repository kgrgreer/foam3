// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentTerms3",
	documentation: "Specifies the payment terms of the underlying transaction.",
	properties: [
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "DueDate",
			shortName: "DueDt",
			documentation: "Due date specified for the payment terms.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PaymentPeriod",
			shortName: "PmtPrd",
			documentation: "Payment period specified for these payment terms.",
			of: "net.nanopay.iso20022.PaymentPeriod1",
			required: false
		},
		{
			class: "StringArray",
			name: "Description",
			shortName: "Desc",
			documentation: "Textual description of these payment terms.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PercentageRate",
			name: "PartialPaymentPercent",
			shortName: "PrtlPmtPct",
			documentation: "Partial payment, expressed as a percentage, for the payment terms.",
			required: false
		},
		{
			class: "StringArray",
			name: "DirectDebitMandateIdentification",
			shortName: "DrctDbtMndtId",
			documentation: "Direct debit mandate identification specified for these payment terms.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "DiscountAmount",
			shortName: "DscntAmt",
			documentation: "Monetary value used as a basis to calculate the discount in these payment terms.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PercentageRate",
			name: "DiscountPercentRate",
			shortName: "DscntPctRate",
			documentation: "Percent rate used to calculate the discount for these payment terms.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "DiscountBasisAmount",
			shortName: "DscntBsisAmt",
			documentation: "Monetary value used as a basis to calculate the discount in these payment terms.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PenaltyAmount",
			shortName: "PnltyAmt",
			documentation: "Monetary value used as a basis to calculate the penalty in the payment terms.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PercentageRate",
			name: "PenaltyPercentRate",
			shortName: "PnltyPctRate",
			documentation: "Percent rate used to calculate the penalty for these payment terms.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PenaltyBasisAmount",
			shortName: "PnltyBsisAmt",
			documentation: "Amount used as a basis to calculate the penalty amount.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		}
	]
});