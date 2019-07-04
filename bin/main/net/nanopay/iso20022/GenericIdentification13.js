// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GenericIdentification13",
	documentation: "Information related to an identification, eg, party identification or account identification.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max4AlphaNumericText",
			name: "Identification",
			shortName: "Id",
			documentation: "Identification assigned by an institution.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "SchemeName",
			shortName: "SchmeNm",
			documentation: "Name of the identification scheme.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Issuer",
			shortName: "Issr",
			documentation: "Entity that assigns the identification.",
			required: false
		}
	]
});