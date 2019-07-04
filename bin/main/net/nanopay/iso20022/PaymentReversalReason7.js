// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentReversalReason7",
	documentation: "Provides further details on the reason of the reversal of the transaction.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Originator",
			shortName: "Orgtr",
			documentation: "Party that issues the reversal.",
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Reason",
			shortName: "Rsn",
			documentation: "Specifies the reason for the reversal.",
			of: "net.nanopay.iso20022.ReversalReason4Choice",
			required: false
		},
		{
			class: "StringArray",
			name: "AdditionalInformation",
			shortName: "AddtlInf",
			documentation: "Further details on the reversal reason.",
			required: false
		}
	]
});