// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DocumentLineInformation1",
	documentation: `Provides document line information.
`,
	properties: [
		{
			class: "FObjectArray",
			name: "Identification",
			shortName: "Id",
			documentation: "Provides identification of the document line.",
			of: "net.nanopay.iso20022.DocumentLineIdentification1",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max2048Text",
			name: "Description",
			shortName: "Desc",
			documentation: "Description associated with the document line.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Amount",
			shortName: "Amt",
			documentation: "Provides details on the amounts of the document line.",
			of: "net.nanopay.iso20022.RemittanceAmount3",
			required: false
		}
	]
});