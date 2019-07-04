// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DocumentLineType1",
	documentation: "Specifies the type of the document line identification.",
	properties: [
		{
			class: "FObjectProperty",
			name: "CodeOrProprietary",
			shortName: "CdOrPrtry",
			documentation: "Provides the type details of the referred document line identification.",
			of: "net.nanopay.iso20022.DocumentLineType1Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Issuer",
			shortName: "Issr",
			documentation: "Identification of the issuer of the reference document line identificationtype.",
			required: false
		}
	]
});