// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GenericAccountIdentification1",
	documentation: "Information related to a generic account identification.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max34Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Identification assigned by an institution.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "SchemeName",
			shortName: "SchmeNm",
			documentation: "Name of the identification scheme.",
			of: "net.nanopay.iso20022.AccountSchemeName1Choice",
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