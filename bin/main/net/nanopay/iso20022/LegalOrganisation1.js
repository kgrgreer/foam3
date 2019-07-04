// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "LegalOrganisation1",
	documentation: "Legally constituted organization specified for this party.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique and unambiguous identifier for an organisation that is allocated by an institution, eg, Dun & Bradstreet Identification.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Specifies the short name of the organisation.",
			required: false
		}
	]
});