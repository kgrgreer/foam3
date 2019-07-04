// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "RegulatoryReporting3",
	documentation: "Information needed due to regulatory and/or statutory requirements.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "DebitCreditReportingIndicator",
			shortName: "DbtCdtRptgInd",
			documentation: "Identifies whether the regulatory reporting information applies to the debit side, to the credit side or to both debit and credit sides of the transaction.",
			of: "net.nanopay.iso20022.RegulatoryReportingType1Code",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Authority",
			shortName: "Authrty",
			documentation: "Entity requiring the regulatory reporting information.",
			of: "net.nanopay.iso20022.RegulatoryAuthority2",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Details",
			shortName: "Dtls",
			documentation: "Set of elements used to provide details on the regulatory reporting information.",
			of: "net.nanopay.iso20022.StructuredRegulatoryReporting3",
			required: false
		}
	]
});