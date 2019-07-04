// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "OrganisationIdentification8",
	documentation: "Unique and unambiguous way to identify an organisation.",
	properties: [
		{
			class: "net.nanopay.iso20022.AnyBICIdentifier",
			name: "AnyBIC",
			shortName: "AnyBIC",
			documentation: "Code allocated to a financial institution or non financial institution by the ISO 9362 Registration Authority as described in ISO 9362 \"Banking - Banking telecommunication messages - Business identifier code (BIC)\".",
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