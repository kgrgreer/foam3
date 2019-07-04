// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DocumentGeneralInformation2",
	documentation: "General information that unambiguously identifies a document, such as identification number and issue date time.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalDocumentType1Code",
			name: "DocumentType",
			shortName: "DocTp",
			documentation: "Specifies the type of the document, for example commercial invoice.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "DocumentNumber",
			shortName: "DocNb",
			documentation: "Unique identifier of the document.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "SenderReceiverSequenceIdentification",
			shortName: "SndrRcvrSeqId",
			documentation: "Specifies the identification sequence number for a specific couple sender/receiver.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "IssueDate",
			shortName: "IsseDt",
			documentation: "Issue date of the document.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max256Text",
			name: "URL",
			shortName: "URL",
			documentation: "URL (Uniform Resource Locator) where the document can be found.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AttachedBinaryFile",
			shortName: "AttchdBinryFile",
			documentation: "Attached binary file for this document.",
			of: "net.nanopay.iso20022.BinaryFile1",
			required: false
		}
	]
});