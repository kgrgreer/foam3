// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ReferredDocumentInformation7",
	documentation: "Set of elements used to identify the documents referred to in the remittance information.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of referred document.",
			of: "net.nanopay.iso20022.ReferredDocumentType4",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Number",
			shortName: "Nb",
			documentation: "Unique and unambiguous identification of the referred document.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "RelatedDate",
			shortName: "RltdDt",
			documentation: "Date associated with the referred document.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "LineDetails",
			shortName: "LineDtls",
			documentation: "Set of elements used to provide the content of the referred document line.",
			of: "net.nanopay.iso20022.DocumentLineInformation1",
			required: false
		}
	]
});