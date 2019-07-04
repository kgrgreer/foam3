// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "FinancialInstitutionIdentification8",
	documentation: "Set of elements used to identify a financial institution.",
	properties: [
		{
			class: "net.nanopay.iso20022.BICFIIdentifier",
			name: "BICFI",
			shortName: "BICFI",
			documentation: "Code allocated to a financial institution by the ISO 9362 Registration Authority as described in ISO 9362 \"Banking - Banking telecommunication messages - Business identifier code (BIC)\".",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ClearingSystemMemberIdentification",
			shortName: "ClrSysMmbId",
			documentation: "Information used to identify a member within a clearing system.",
			of: "net.nanopay.iso20022.ClearingSystemMemberIdentification2",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name by which an agent is known and which is usually used to identify that agent.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PostalAddress",
			shortName: "PstlAdr",
			documentation: "Information that locates and identifies a specific address, as defined by postal services.",
			of: "net.nanopay.iso20022.PostalAddress6",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Other",
			shortName: "Othr",
			documentation: "Unique identification of an agent, as assigned by an institution, using an identification scheme.",
			of: "net.nanopay.iso20022.GenericFinancialIdentification1",
			required: false
		}
	]
});