// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GroupHeader53",
	documentation: "Set of characteristics shared by all individual transactions included in the message.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "MessageIdentification",
			shortName: "MsgId",
			documentation: `Point to point reference, as assigned by the instructing party, and sent to the next party in the chain to unambiguously identify the message.
Usage: The instructing party has to make sure that MessageIdentification is unique per instructed party for a pre-agreed period.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "CreationDateTime",
			shortName: "CreDtTm",
			documentation: "Date and time at which the message was created.",
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
		}
	]
});