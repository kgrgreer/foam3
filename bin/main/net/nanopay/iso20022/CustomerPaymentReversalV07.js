// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CustomerPaymentReversalV07",
	documentation: `Scope
The CustomerPaymentReversal message is sent by the initiating party to the next party in the payment chain. It is used to reverse a payment previously executed.
Usage
The CustomerPaymentReversal message is exchanged between a non-financial institution customer and an agent to reverse a CustomerDirectDebitInitiation message that has been settled. The result will be a credit on the debtor account.
The CustomerPaymentReversal message refers to the original CustomerDirectDebitInitiation message by means of references only or by means of references and a set of elements from the original instruction.
The CustomerPaymentReversal message can be used in domestic and cross-border scenarios.`,
	properties: [
		{
			class: "FObjectProperty",
			name: "GroupHeader",
			shortName: "GrpHdr",
			documentation: "Set of characteristics shared by all individual transactions included in the message.",
			of: "net.nanopay.iso20022.GroupHeader56",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalGroupInformation",
			shortName: "OrgnlGrpInf",
			documentation: "Information concerning the original group of transactions, to which the message refers.",
			of: "net.nanopay.iso20022.OriginalGroupHeader3",
			required: false
		},
		{
			class: "FObjectArray",
			name: "OriginalPaymentInformationAndReversal",
			shortName: "OrgnlPmtInfAndRvsl",
			documentation: "Information concerning the original payment information, to which the reversal message refers.",
			of: "net.nanopay.iso20022.OriginalPaymentInstruction21",
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