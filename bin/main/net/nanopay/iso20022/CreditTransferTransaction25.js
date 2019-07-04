// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CreditTransferTransaction25",
	documentation: "Provides further details specific to the individual transaction(s) included in the message.",
	properties: [
		{
			class: "FObjectProperty",
			name: "PaymentIdentification",
			shortName: "PmtId",
			documentation: "Set of elements used to reference a payment instruction.",
			of: "net.nanopay.iso20022.PaymentIdentification3",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PaymentTypeInformation",
			shortName: "PmtTpInf",
			documentation: "Set of elements used to further specify the type of transaction.",
			of: "net.nanopay.iso20022.PaymentTypeInformation21",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InterbankSettlementAmount",
			shortName: "IntrBkSttlmAmt",
			documentation: "Amount of money moved between the instructing agent and the instructed agent.",
			of: "net.nanopay.iso20022.ActiveCurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "InterbankSettlementDate",
			shortName: "IntrBkSttlmDt",
			documentation: "Date on which the amount of money ceases to be available to the agent that owes it and when the amount of money becomes available to the agent to which it is due.",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "SettlementPriority",
			shortName: "SttlmPrty",
			documentation: "Indicator of the urgency or order of importance that the instructing party would like the instructed party to apply to the processing of the settlement instruction.",
			of: "net.nanopay.iso20022.Priority3Code",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "SettlementTimeIndication",
			shortName: "SttlmTmIndctn",
			documentation: "Provides information on the occurred settlement time(s) of the payment transaction.",
			of: "net.nanopay.iso20022.SettlementDateTimeIndication1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "SettlementTimeRequest",
			shortName: "SttlmTmReq",
			documentation: "Provides information on the requested settlement time(s) of the payment instruction.",
			of: "net.nanopay.iso20022.SettlementTimeRequest2",
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
			class: "net.nanopay.iso20022.ISODate",
			name: "PoolingAdjustmentDate",
			shortName: "PoolgAdjstmntDt",
			documentation: "Date used for the correction of the value date of a cash pool movement that has been posted with a different value date.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructedAmount",
			shortName: "InstdAmt",
			documentation: `Amount of money to be moved between the debtor and creditor, before deduction of charges, expressed in the currency as ordered by the initiating party.
Usage: This amount has to be transported unchanged through the transaction chain.`,
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.BaseOneRate",
			name: "ExchangeRate",
			shortName: "XchgRate",
			documentation: "Factor used to convert an amount from one currency into another. This reflects the price at which one currency was bought with another currency.",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "ChargeBearer",
			shortName: "ChrgBr",
			documentation: "Specifies which party/parties will bear the charges associated with the processing of the payment transaction.",
			of: "net.nanopay.iso20022.ChargeBearerType1Code",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ChargesInformation",
			shortName: "ChrgsInf",
			documentation: "Provides information on the charges to be paid by the charge bearer(s) related to the payment transaction.",
			of: "net.nanopay.iso20022.Charges2",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PreviousInstructingAgent",
			shortName: "PrvsInstgAgt",
			documentation: "Agent immediately prior to the instructing agent.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PreviousInstructingAgentAccount",
			shortName: "PrvsInstgAgtAcct",
			documentation: "Unambiguous identification of the account of the previous instructing agent at its servicing agent in the payment chain.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructingAgent",
			shortName: "InstgAgt",
			documentation: "Agent that instructs the next party in the chain to carry out the (set of) instruction(s).",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InstructedAgent",
			shortName: "InstdAgt",
			documentation: "Agent that is instructed by the previous party in the chain to carry out the (set of) instruction(s).",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "IntermediaryAgent1",
			shortName: "IntrmyAgt1",
			documentation: `Agent between the debtor's agent and the creditor's agent.

Usage: If more than one intermediary agent is present, then IntermediaryAgent1 identifies the agent between the DebtorAgent and the IntermediaryAgent2.`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "IntermediaryAgent1Account",
			shortName: "IntrmyAgt1Acct",
			documentation: "Unambiguous identification of the account of the intermediary agent 1 at its servicing agent in the payment chain.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "IntermediaryAgent2",
			shortName: "IntrmyAgt2",
			documentation: `Agent between the debtor's agent and the creditor's agent.

Usage: If more than two intermediary agents are present, then IntermediaryAgent2 identifies the agent between the IntermediaryAgent1 and the IntermediaryAgent3.`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "IntermediaryAgent2Account",
			shortName: "IntrmyAgt2Acct",
			documentation: "Unambiguous identification of the account of the intermediary agent 2 at its servicing agent in the payment chain.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "IntermediaryAgent3",
			shortName: "IntrmyAgt3",
			documentation: `Agent between the debtor's agent and the creditor's agent.

Usage: If IntermediaryAgent3 is present, then it identifies the agent between the IntermediaryAgent 2 and the CreditorAgent.`,
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "IntermediaryAgent3Account",
			shortName: "IntrmyAgt3Acct",
			documentation: "Unambiguous identification of the account of the intermediary agent 3 at its servicing agent in the payment chain.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "UltimateDebtor",
			shortName: "UltmtDbtr",
			documentation: "Ultimate party that owes an amount of money to the (ultimate) creditor.",
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InitiatingParty",
			shortName: "InitgPty",
			documentation: `Party that initiates the payment.
Usage: This can be either the debtor or a party that initiates the credit transfer on behalf of the debtor.`,
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Debtor",
			shortName: "Dbtr",
			documentation: "Party that owes an amount of money to the (ultimate) creditor.",
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "DebtorAccount",
			shortName: "DbtrAcct",
			documentation: "Unambiguous identification of the account of the debtor to which a debit entry will be made as a result of the transaction.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "DebtorAgent",
			shortName: "DbtrAgt",
			documentation: "Financial institution servicing an account for the debtor.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "DebtorAgentAccount",
			shortName: "DbtrAgtAcct",
			documentation: "Unambiguous identification of the account of the debtor agent at its servicing agent in the payment chain.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "CreditorAgent",
			shortName: "CdtrAgt",
			documentation: "Financial institution servicing an account for the creditor.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "CreditorAgentAccount",
			shortName: "CdtrAgtAcct",
			documentation: "Unambiguous identification of the account of the creditor agent at its servicing agent to which a credit entry will be made as a result of the payment transaction.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Creditor",
			shortName: "Cdtr",
			documentation: "Party to which an amount of money is due.",
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "CreditorAccount",
			shortName: "CdtrAcct",
			documentation: "Unambiguous identification of the account of the creditor to which a credit entry will be posted as a result of the payment transaction.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "UltimateCreditor",
			shortName: "UltmtCdtr",
			documentation: "Ultimate party to which an amount of money is due.",
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectArray",
			name: "InstructionForCreditorAgent",
			shortName: "InstrForCdtrAgt",
			documentation: "Further information related to the processing of the payment instruction, provided by the initiating party, and intended for the creditor agent.",
			of: "net.nanopay.iso20022.InstructionForCreditorAgent1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "InstructionForNextAgent",
			shortName: "InstrForNxtAgt",
			documentation: `Further information related to the processing of the payment instruction that may need to be acted upon by the next agent. 

Usage: The next agent may not be the creditor agent.
The instruction can relate to a level of service, can be an instruction that has to be executed by the agent, or can be information required by the next agent.`,
			of: "net.nanopay.iso20022.InstructionForNextAgent1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Purpose",
			shortName: "Purp",
			documentation: `Underlying reason for the payment transaction.
Usage: Purpose is used by the end-customers, that is initiating party, (ultimate) debtor, (ultimate) creditor to provide information concerning the nature of the payment. Purpose is a content element, which is not used for processing by any of the agents involved in the payment chain.`,
			of: "net.nanopay.iso20022.Purpose2Choice",
			required: false
		},
		{
			class: "FObjectArray",
			name: "RegulatoryReporting",
			shortName: "RgltryRptg",
			documentation: "Information needed due to regulatory and statutory requirements.",
			of: "net.nanopay.iso20022.RegulatoryReporting3",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Tax",
			shortName: "Tax",
			documentation: "Provides details on the tax.",
			of: "net.nanopay.iso20022.TaxInformation3",
			required: false
		},
		{
			class: "FObjectArray",
			name: "RelatedRemittanceInformation",
			shortName: "RltdRmtInf",
			documentation: "Provides information related to the handling of the remittance information by any of the agents in the transaction processing chain.",
			of: "net.nanopay.iso20022.RemittanceLocation4",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "RemittanceInformation",
			shortName: "RmtInf",
			documentation: "Information supplied to enable the matching of an entry with the items that the transfer is intended to settle, such as commercial invoices in an accounts' receivable system.",
			of: "net.nanopay.iso20022.RemittanceInformation11",
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