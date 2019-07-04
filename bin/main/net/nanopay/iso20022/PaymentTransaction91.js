// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentTransaction91",
	documentation: "Provides further details on the original transactions, to which the status report message refers.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "StatusIdentification",
			shortName: "StsId",
			documentation: `Unique identification, as assigned by an instructing party for an instructed party, to unambiguously identify the reported status.
Usage: The instructing party is the party sending the status message and not the party that sent the original instruction that is being reported on.`,
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalGroupInformation",
			shortName: "OrgnlGrpInf",
			documentation: "Point to point reference, as assigned by the original instructing party, to unambiguously identify the original message.",
			of: "net.nanopay.iso20022.OriginalGroupInformation29",
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
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalTransactionIdentification",
			shortName: "OrgnlTxId",
			documentation: "Unique identification, as assigned by the original first instructing agent, to unambiguously identify the transaction.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ExternalPaymentTransactionStatus1Code",
			name: "TransactionStatus",
			shortName: "TxSts",
			documentation: "Specifies the status of a transaction, in a coded form.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "StatusReasonInformation",
			shortName: "StsRsnInf",
			documentation: "Provides detailed information on the status reason.",
			of: "net.nanopay.iso20022.StatusReasonInformation11",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ChargesInformation",
			shortName: "ChrgsInf",
			documentation: `Provides information on the charges related to the processing of the rejection of the instruction.

Usage: This is passed on for information purposes only. Settlement of the charges will be done separately.`,
			of: "net.nanopay.iso20022.Charges2",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "AcceptanceDateTime",
			shortName: "AccptncDtTm",
			documentation: "Point in time when the payment order from the initiating party meets the processing conditions of the account servicing agent. This means that the account servicing agent has received the payment order and has applied checks such as authorisation, availability of funds.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "AccountServicerReference",
			shortName: "AcctSvcrRef",
			documentation: "Unique reference, as assigned by the account servicing institution, to unambiguously identify the instruction.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "ClearingSystemReference",
			shortName: "ClrSysRef",
			documentation: "Unique reference, as assigned by a clearing system, to unambiguously identify the instruction.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructingAgent",
			shortName: "InstgAgt",
			documentation: `Agent that instructs the next party in the chain to carry out the (set of) instruction(s).

Usage: The instructing agent is the party sending the status message and not the party that sent the original instruction that is being reported on.`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructedAgent",
			shortName: "InstdAgt",
			documentation: `Agent that is instructed by the previous party in the chain to carry out the (set of) instruction(s).

Usage: The instructed agent is the party receiving the status message and not the party that received the original instruction that is being reported on.`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalTransactionReference",
			shortName: "OrgnlTxRef",
			documentation: "Key elements used to identify the original transaction that is being referred to.",
			of: "net.nanopay.iso20022.OriginalTransactionReference27",
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