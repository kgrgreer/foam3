// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GroupHeader56",
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
			class: "FObjectArray",
			name: "Authorisation",
			shortName: "Authstn",
			documentation: `User identification or any user key to be used to check whether the initiating party is allowed to initiate transactions from the account specified in the message.

Usage: The content is not of a technical nature, but reflects the organisational structure at the initiating side.
The authorisation element can typically be used in relay scenarios, payment initiations, payment returns or payment reversals that are initiated on behalf of a party different from the initiating party.`,
			of: "net.nanopay.iso20022.Authorisation1Choice",
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
			class: "net.nanopay.iso20022.TrueFalseIndicator",
			name: "GroupReversal",
			shortName: "GrpRvsl",
			documentation: "Indicates whether the reversal applies to the whole group of transactions or to individual transactions within the original group.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InitiatingParty",
			shortName: "InitgPty",
			documentation: `Party that initiates the reversal message. 
Usage: This can be either the creditor or a party that initiates the reversal of the direct debit on behalf of the creditor.`,
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ForwardingAgent",
			shortName: "FwdgAgt",
			documentation: "Financial institution that receives the instruction from the initiating party and forwards it to the next agent in the payment chain.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
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
			name: "CreditorAgent",
			shortName: "CdtrAgt",
			documentation: "Financial institution servicing an account for the creditor.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		}
	]
});