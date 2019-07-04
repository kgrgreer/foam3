// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "RemittanceAmount3",
	documentation: "Nature of the amount and currency on a document referred to in the remittance section, typically either the original amount due/payable or the amount actually remitted for the referenced document.",
	properties: [
		{
			class: "FObjectProperty",
			name: "DuePayableAmount",
			shortName: "DuePyblAmt",
			documentation: "Amount specified is the exact amount due and payable to the creditor.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "DiscountAppliedAmount",
			shortName: "DscntApldAmt",
			documentation: "Amount of discount to be applied to the amount due and payable to the creditor.",
			of: "net.nanopay.iso20022.DiscountAmountAndType1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "CreditNoteAmount",
			shortName: "CdtNoteAmt",
			documentation: "Amount of a credit note.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TaxAmount",
			shortName: "TaxAmt",
			documentation: "Amount of the tax.",
			of: "net.nanopay.iso20022.TaxAmountAndType1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AdjustmentAmountAndReason",
			shortName: "AdjstmntAmtAndRsn",
			documentation: "Specifies detailed information on the amount and reason of the adjustment.",
			of: "net.nanopay.iso20022.DocumentAdjustment1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "RemittedAmount",
			shortName: "RmtdAmt",
			documentation: "Amount of money remitted.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		}
	]
});