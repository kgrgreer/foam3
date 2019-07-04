// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "InvoiceHeader1",
	documentation: "Collection of data for that is exchanged between two or more parties in written, printed or electronic form.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique identification of this invoice document.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ExternalDocumentType1Code",
			name: "TypeCode",
			shortName: "TpCd",
			documentation: "Specifies the type of the document, for example commercial invoice.",
			required: false
		},
		{
			class: "StringArray",
			name: "Name",
			shortName: "Nm",
			documentation: "Name of invoice document or transaction, for example, tax invoice.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "IssueDateTime",
			shortName: "IsseDtTm",
			documentation: "Issue date of the document.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Issuer",
			shortName: "Issr",
			documentation: "Party that issued this invoice document.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "net.nanopay.iso20022.LanguageCode",
			name: "LanguageCode",
			shortName: "LangCd",
			documentation: "Unique identifier for a language used in this invoice document.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.YesNoIndicator",
			name: "CopyIndicator",
			shortName: "CpyInd",
			documentation: `Indicator that the document is a copy of the
original document.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.ExternalDocumentPurpose1Code",
			name: "DocumentPurpose",
			shortName: "DocPurp",
			documentation: "Specifies the function of the document.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "IncludedNote",
			shortName: "InclNote",
			documentation: "Note included in this invoice document.",
			of: "net.nanopay.iso20022.AdditionalInformation6",
			required: false
		}
	]
});