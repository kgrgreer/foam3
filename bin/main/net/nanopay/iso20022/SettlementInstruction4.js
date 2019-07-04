// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "SettlementInstruction4",
	documentation: "Provides further details on the settlement of the instruction.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "SettlementMethod",
			shortName: "SttlmMtd",
			documentation: "Method used to settle the (batch of) payment instructions.",
			of: "net.nanopay.iso20022.SettlementMethod1Code",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "SettlementAccount",
			shortName: "SttlmAcct",
			documentation: "A specific purpose account used to post debit and credit entries as a result of the transaction.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ClearingSystem",
			shortName: "ClrSys",
			documentation: "Specification of a pre-agreed offering between clearing agents or the channel through which the payment instruction is processed.",
			of: "net.nanopay.iso20022.ClearingSystemIdentification3Choice",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructingReimbursementAgent",
			shortName: "InstgRmbrsmntAgt",
			documentation: `Agent through which the instructing agent will reimburse the instructed agent.

Usage: If InstructingAgent and InstructedAgent have the same reimbursement agent, then only InstructingReimbursementAgent must be used.`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructingReimbursementAgentAccount",
			shortName: "InstgRmbrsmntAgtAcct",
			documentation: "Unambiguous identification of the account of the instructing reimbursement agent account at its servicing agent in the payment chain.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructedReimbursementAgent",
			shortName: "InstdRmbrsmntAgt",
			documentation: `Agent at which the instructed agent will be reimbursed.
Usage: If InstructedReimbursementAgent contains a branch of the InstructedAgent, then the party in InstructedAgent will claim reimbursement from that branch/will be paid by that branch.
Usage: If InstructingAgent and InstructedAgent have the same reimbursement agent, then only InstructingReimbursementAgent must be used.`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructedReimbursementAgentAccount",
			shortName: "InstdRmbrsmntAgtAcct",
			documentation: "Unambiguous identification of the account of the instructed reimbursement agent account at its servicing agent in the payment chain.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ThirdReimbursementAgent",
			shortName: "ThrdRmbrsmntAgt",
			documentation: `Agent at which the instructed agent will be reimbursed.
Usage: If ThirdReimbursementAgent contains a branch of the InstructedAgent, then the party in InstructedAgent will claim reimbursement from that branch/will be paid by that branch.`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ThirdReimbursementAgentAccount",
			shortName: "ThrdRmbrsmntAgtAcct",
			documentation: "Unambiguous identification of the account of the third reimbursement agent account at its servicing agent in the payment chain.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		}
	]
});