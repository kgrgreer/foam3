// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentTransaction77",
	documentation: "Provides further details on the reference and status on the original transactions, included in the original instruction, to which the reversal message applies.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "ReversalIdentification",
			shortName: "RvslId",
			documentation: `Unique identification, as assigned by an instructing party for an instructed party, to unambiguously identify the reversed transaction.
Usage: The instructing party is the party sending the reversal message and not the party that sent the original instruction that is being reversed.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalInstructionIdentification",
			shortName: "OrgnlInstrId",
			documentation: "Unique identification, as assigned by the original instructing party for the original instructed party, to unambiguously identify the original instruction.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalEndToEndIdentification",
			shortName: "OrgnlEndToEndId",
			documentation: "Unique identification, as assigned by the original initiating party, to unambiguously identify the original transaction.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalInstructedAmount",
			shortName: "OrgnlInstdAmt",
			documentation: `Amount of money, as provided in the original transaction, to be moved between the debtor and the creditor, before deduction of charges, expressed in the currency, as ordered by the original initiating party.
Usage: This amount has to be transported unchanged through the transaction chain.`,
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ReversedInstructedAmount",
			shortName: "RvsdInstdAmt",
			documentation: `Amount of money to be moved between the debtor and the creditor, before deduction of charges, in the reversed transaction.
Usage: This amount has to be transported unchanged through the transaction chain.`,
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "ChargeBearer",
			shortName: "ChrgBr",
			documentation: `Specifies if the creditor and/or debtor will bear the charges associated with the processing of the payment transaction.

Usage: The ChargeBearer applies to the reversal message, not to the original instruction.`,
			of: "net.nanopay.iso20022.ChargeBearerType1Code",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ReversalReasonInformation",
			shortName: "RvslRsnInf",
			documentation: "Provides detailed information on the reversal reason.",
			of: "net.nanopay.iso20022.PaymentReversalReason7",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalTransactionReference",
			shortName: "OrgnlTxRef",
			documentation: "Key elements used to identify the original transaction that is being referred to.",
			of: "net.nanopay.iso20022.OriginalTransactionReference24",
			required: false
		},
		{
			class: "FObjectArray",
			name: "SupplementaryData",
			shortName: "SplmtryData",
			documentation: "Additional information that cannot be captured in the structured elements and/or any other specific block.",
			of: "net.nanopay.iso20022.SupplementaryData1",
			required: false
		}
	]
});