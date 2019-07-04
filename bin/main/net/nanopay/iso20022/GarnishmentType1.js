// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GarnishmentType1",
	documentation: "Specifies the type of garnishment.",
	properties: [
		{
			class: "FObjectProperty",
			name: "CodeOrProprietary",
			shortName: "CdOrPrtry",
			documentation: "Provides the type details of the garnishment.",
			of: "net.nanopay.iso20022.GarnishmentType1Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Issuer",
			shortName: "Issr",
			documentation: "Identification of the issuer of the garnishment type.",
			required: false
		}
	]
});