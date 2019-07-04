// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentTransaction73",
	documentation: "Provides further details on the original transactions, to which the status report message refers.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "StatusRequestIdentification",
			shortName: "StsReqId",
			documentation: `Unique identification, as assigned by an instructing party for an instructed party, to unambiguously identify the status request.
Usage: The instructing party is the party sending the request message and not the party that sent the original instruction that is being reported on.`,
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalGroupInformation",
			shortName: "OrgnlGrpInf",
			documentation: "Point to point reference, as assigned by the original instructing party, to unambiguously identify the original message.",
			of: "net.nanopay.iso20022.OriginalGroupInformation3",
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
			class: "net.nanopay.iso20022.ISODateTime",
			name: "AcceptanceDateTime",
			shortName: "AccptncDtTm",
			documentation: "Point in time when the payment order from the initiating party meets the processing conditions of the account servicing agent. This means that the account servicing agent has received the payment order and has applied checks such as authorisation, availability of funds.",
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

`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructedAgent",
			shortName: "InstdAgt",
			documentation: `Agent that is instructed by the previous party in the chain to carry out the (set of) instruction(s).

`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
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