// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "RemittanceAmount2",
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
			documentation: "Amount specified for the referred document is the amount of discount to be applied to the amount due and payable to the creditor.",
			of: "net.nanopay.iso20022.DiscountAmountAndType1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "CreditNoteAmount",
			shortName: "CdtNoteAmt",
			documentation: "Amount specified for the referred document is the amount of a credit note.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TaxAmount",
			shortName: "TaxAmt",
			documentation: "Quantity of cash resulting from the calculation of the tax.",
			of: "net.nanopay.iso20022.TaxAmountAndType1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AdjustmentAmountAndReason",
			shortName: "AdjstmntAmtAndRsn",
			documentation: "Specifies detailed information on the amount and reason of the document adjustment.",
			of: "net.nanopay.iso20022.DocumentAdjustment1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "RemittedAmount",
			shortName: "RmtdAmt",
			documentation: "Amount of money remitted for the referred document.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		}
	]
});