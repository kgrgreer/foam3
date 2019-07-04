// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "StatusReasonInformation11",
	documentation: "Set of elements used to provide information on the status reason of the transaction.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Originator",
			shortName: "Orgtr",
			documentation: "Party that issues the status.",
			of: "net.nanopay.iso20022.PartyIdentification125",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Reason",
			shortName: "Rsn",
			documentation: "Specifies the reason for the status report.",
			of: "net.nanopay.iso20022.StatusReason6Choice",
			required: false
		},
		{
			class: "StringArray",
			name: "AdditionalInformation",
			shortName: "AddtlInf",
			documentation: `Further details on the status reason.

Usage: Additional information can be used for several purposes such as the reporting of repaired information.`,
			required: false
		}
	]
});