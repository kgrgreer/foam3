// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Pacs02800101",
	documentation: "General information that unambiguously identifies a document, such as identification number and issue date time.",
	implements: [
		"net.nanopay.iso20022.Document"
	],
	properties: [
		{
			class: "String",
			name: "xmlns",
			value: "urn:iso:std:iso:20022:tech:xsd:pacs.028.001.01",
			xmlAttribute: true
		},
		{
			class: "FObjectProperty",
			name: "FIToFIPmtStsReq",
			of: "net.nanopay.iso20022.FIToFIPaymentStatusRequestV01",
			required: false
		}
	]
});