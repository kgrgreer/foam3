// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "RemittanceLocation4",
	documentation: "Set of elements used to provide information on the remittance advice.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "RemittanceIdentification",
			shortName: "RmtId",
			documentation: "Unique identification, as assigned by the initiating party, to unambiguously identify the remittance information sent separately from the payment instruction, such as a remittance advice.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "RemittanceLocationDetails",
			shortName: "RmtLctnDtls",
			documentation: "Set of elements used to provide information on the location and/or delivery of the remittance information.",
			of: "net.nanopay.iso20022.RemittanceLocationDetails1",
			required: false
		}
	]
});