// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Pain00700107",
	documentation: "General information that unambiguously identifies a document, such as identification number and issue date time.",
	implements: [
		"net.nanopay.iso20022.Document"
	],
	properties: [
		{
			class: "String",
			name: "xmlns",
			value: "urn:iso:std:iso:20022:tech:xsd:pain.007.001.07",
			xmlAttribute: true
		},
		{
			class: "FObjectProperty",
			name: "CstmrPmtRvsl",
			of: "net.nanopay.iso20022.CustomerPaymentReversalV07",
			required: false
		}
	]
});