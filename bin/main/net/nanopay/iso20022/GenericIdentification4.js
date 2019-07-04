// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GenericIdentification4",
	documentation: "Information related to an identification, eg, party identification or account identification.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Identifier issued to a person for which no specific identifier has been defined.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "IdentificationType",
			shortName: "IdTp",
			documentation: `Specifies the nature of the identifier.
Usage: IdentificationType is used to specify what kind of identifier is used. It should be used in case the identifier is different from the identifiers listed in the pre-defined identifier list.`,
			required: false
		}
	]
});