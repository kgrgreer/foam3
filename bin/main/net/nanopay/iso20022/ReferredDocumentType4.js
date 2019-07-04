// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ReferredDocumentType4",
	documentation: "Specifies the type of the document referred in the remittance information.",
	properties: [
		{
			class: "FObjectProperty",
			name: "CodeOrProprietary",
			shortName: "CdOrPrtry",
			documentation: "Provides the type details of the referred document.",
			of: "net.nanopay.iso20022.ReferredDocumentType3Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Issuer",
			shortName: "Issr",
			documentation: "Identification of the issuer of the reference document type.",
			required: false
		}
	]
});