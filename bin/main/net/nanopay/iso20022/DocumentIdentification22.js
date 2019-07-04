// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DocumentIdentification22",
	documentation: "Identifies a document by a unique identification and a date of issue.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Identifies the document.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "DateOfIssue",
			shortName: "DtOfIsse",
			documentation: "Date of issuance of the document.",
			required: false
		}
	]
});