// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CreditorReferenceType2",
	documentation: "Specifies the type of creditor reference.",
	properties: [
		{
			class: "FObjectProperty",
			name: "CodeOrProprietary",
			shortName: "CdOrPrtry",
			documentation: "Coded or proprietary format creditor reference type.",
			of: "net.nanopay.iso20022.CreditorReferenceType1Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Issuer",
			shortName: "Issr",
			documentation: "Entity that assigns the credit reference type.",
			required: false
		}
	]
});