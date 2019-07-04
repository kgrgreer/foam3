// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DocumentLineIdentification1",
	documentation: "Identifies the documents referred to in the remittance information.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of referred document line identification.",
			of: "net.nanopay.iso20022.DocumentLineType1",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Number",
			shortName: "Nb",
			documentation: "Identification of the type specified for the referred document line.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "RelatedDate",
			shortName: "RltdDt",
			documentation: "Date associated with the referred document line.",
			required: false
		}
	]
});