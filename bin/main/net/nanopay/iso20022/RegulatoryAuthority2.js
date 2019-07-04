// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "RegulatoryAuthority2",
	documentation: "Entity requiring the regulatory reporting information.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name of the entity requiring the regulatory reporting information.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.CountryCode",
			name: "Country",
			shortName: "Ctry",
			documentation: "Country of the entity that requires the regulatory reporting information.",
			required: false
		}
	]
});