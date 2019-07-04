// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentIdentification3",
	documentation: "Set of elements used to provide further means of referencing a payment transaction.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "InstructionIdentification",
			shortName: "InstrId",
			documentation: `Unique identification, as assigned by an instructing party for an instructed party, to unambiguously identify the instruction.

Usage: The instruction identification is a point to point reference that can be used between the instructing party and the instructed party to refer to the individual instruction. It can be included in several messages related to the instruction.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "EndToEndIdentification",
			shortName: "EndToEndId",
			documentation: `Unique identification, as assigned by the initiating party, to unambiguously identify the transaction. This identification is passed on, unchanged, throughout the entire end-to-end chain.

Usage: The end-to-end identification can be used for reconciliation or to link tasks relating to the transaction. It can be included in several messages related to the transaction.

Usage: In case there are technical limitations to pass on multiple references, the end-to-end identification must be passed on throughout the entire end-to-end chain.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "TransactionIdentification",
			shortName: "TxId",
			documentation: `Unique identification, as assigned by the first instructing agent, to unambiguously identify the transaction that is passed on, unchanged, throughout the entire interbank chain. 
Usage: The transaction identification can be used for reconciliation, tracking or to link tasks relating to the transaction on the interbank level. 
Usage: The instructing agent has to make sure that the transaction identification is unique for a pre-agreed period.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "ClearingSystemReference",
			shortName: "ClrSysRef",
			documentation: "Unique reference, as assigned by a clearing system, to unambiguously identify the instruction.",
			required: false
		}
	]
});