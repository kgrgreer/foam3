// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GenericFinancialIdentification1",
	documentation: "Information related to an identification of a financial institution.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique and unambiguous identification of a person.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "SchemeName",
			shortName: "SchmeNm",
			documentation: "Name of the identification scheme.",
			of: "net.nanopay.iso20022.FinancialIdentificationSchemeName1Choice",
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