// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "FIToFIPaymentStatusRequestV01",
	documentation: `Scope
The FinancialInstitutionToFinancialInstitutionPaymentStatusRequest message is sent by the debtor agent to the creditor agent, directly or through other agents and/or a payment clearing and settlement system. It is used to request a FIToFIPaymentStatusReport message containing information on the status of a previously sent instruction. 
Usage
The FIToFIPaymentStatusRequest message is exchanged between agents to request status information about instructions previously sent. Its usage will always be governed by a bilateral agreement between the agents.
The FIToFIPaymentStatusRequest message can be used to request information about the status (e.g. rejection, acceptance) of a credit transfer instruction, a direct debit instruction, as well as other intra-agent instructions (for example FIToFIPaymentCancellationRequest).
The FIToFIPaymentStatusRequest message refers to the original instruction(s) by means of references only or by means of references and a set of elements from the original instruction.
The FIToFIPaymentStatusRequest message can be used in domestic and cross-border scenarios.

`,
	properties: [
		{
			class: "FObjectProperty",
			name: "GroupHeader",
			shortName: "GrpHdr",
			documentation: "Set of characteristics shared by all individual transactions included in the status request message.",
			of: "net.nanopay.iso20022.GroupHeader53",
			required: false
		},
		{
			class: "FObjectArray",
			name: "OriginalGroupInformation",
			shortName: "OrgnlGrpInf",
			documentation: "Original group information concerning the group of transactions, to which the status request message refers to.",
			of: "net.nanopay.iso20022.OriginalGroupInformation27",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TransactionInformation",
			shortName: "TxInf",
			documentation: "Information concerning the original transaction, to which the status request message refers.",
			of: "net.nanopay.iso20022.PaymentTransaction73",
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