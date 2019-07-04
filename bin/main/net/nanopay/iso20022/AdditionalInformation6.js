// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "AdditionalInformation6",
	documentation: "Additional information about a request.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalInformationType1Code",
			name: "InformationType",
			shortName: "InfTp",
			documentation: "Specifies the type of additional information.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max350Text",
			name: "InformationValue",
			shortName: "InfVal",
			documentation: "Contents of the additional information.",
			required: false
		}
	]
});