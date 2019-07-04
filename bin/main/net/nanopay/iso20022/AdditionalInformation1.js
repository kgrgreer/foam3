// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "AdditionalInformation1",
	documentation: "Additional information about a request (e.g. financing request).",
	properties: [
		{
			class: "FObjectProperty",
			name: "InformationType",
			shortName: "InfTp",
			documentation: "Specifies the type of additional information.",
			of: "net.nanopay.iso20022.InformationType1Choice",
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