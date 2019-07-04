// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "FIToFIPaymentStatusReportV09",
	documentation: `Scope
The FIToFIPaymentStatusReport message is sent by an instructed agent to the previous party in the payment chain. It is used to inform this party about the positive or negative status of an instruction (either single or file). It is also used to report on a pending instruction.
Usage
The FIToFIPaymentStatusReport message is exchanged between agents to provide status information about instructions previously sent. Its usage will always be governed by a bilateral agreement between the agents.
The FIToFIPaymentStatusReport message can be used to provide information about the status (e.g. rejection, acceptance) of a credit transfer instruction, a direct debit instruction, as well as other intra-agent instructions (for example FIToFIPaymentCancellationRequest).
The FIToFIPaymentStatusReport message refers to the original instruction(s) by means of references only or by means of references and a set of elements from the original instruction.
The FIToFIPaymentStatusReport message can be used in domestic and cross-border scenarios.
The FIToFIPaymentStatusReport may also be sent to the receiver of the payment in a real time payment scenario, as both sides of the transactions must be informed of the status of the transaction (e.g. either the beneficiary is credited, or the transaction is rejected).`,
	properties: [
		{
			class: "FObjectProperty",
			name: "GroupHeader",
			shortName: "GrpHdr",
			documentation: "Set of characteristics shared by all individual transactions included in the status report message.",
			of: "net.nanopay.iso20022.GroupHeader53",
			required: false
		},
		{
			class: "FObjectArray",
			name: "OriginalGroupInformationAndStatus",
			shortName: "OrgnlGrpInfAndSts",
			documentation: "Original group information concerning the group of transactions, to which the status report message refers to.",
			of: "net.nanopay.iso20022.OriginalGroupHeader13",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TransactionInformationAndStatus",
			shortName: "TxInfAndSts",
			documentation: "Information concerning the original transactions, to which the status report message refers.",
			of: "net.nanopay.iso20022.PaymentTransaction91",
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