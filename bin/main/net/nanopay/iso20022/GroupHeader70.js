// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GroupHeader70",
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
			class: "net.nanopay.iso20022.BatchBookingIndicator",
			name: "BatchBooking",
			shortName: "BtchBookg",
			documentation: `Identifies whether a single entry per individual transaction or a batch entry for the sum of the amounts of all transactions within the group of a message is requested.
Usage: Batch booking is used to request and not order a possible batch booking.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max15NumericText",
			name: "NumberOfTransactions",
			shortName: "NbOfTxs",
			documentation: "Number of individual transactions contained in the message.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.DecimalNumber",
			name: "ControlSum",
			shortName: "CtrlSum",
			documentation: "Total of all individual amounts included in the message, irrespective of currencies.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TotalInterbankSettlementAmount",
			shortName: "TtlIntrBkSttlmAmt",
			documentation: "Total amount of money moved between the instructing agent and the instructed agent.",
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
			class: "FObjectProperty",
			name: "SettlementInformation",
			shortName: "SttlmInf",
			documentation: "Specifies the details on how the settlement of the transaction(s) between the instructing agent and the instructed agent is completed.",
			of: "net.nanopay.iso20022.SettlementInstruction4",
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
		}
	]
});