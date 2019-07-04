// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "OrganisationIdentification6",
	documentation: "Unique and unambiguous way to identify an organisation.",
	properties: [
		{
			class: "net.nanopay.iso20022.AnyBICIdentifier",
			name: "BIC",
			shortName: "BIC",
			documentation: "Code allocated to organisations by the ISO 9362 Registration Authority, under an international identification scheme, as described in the latest version of the standard ISO 9362 Banking (Banking telecommunication messages, Business Identifier Codes).",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Other",
			shortName: "Othr",
			documentation: "Unique identification of an organisation, as assigned by an institution, using an identification scheme.",
			of: "net.nanopay.iso20022.GenericOrganisationIdentification1",
			required: false
		}
	]
});