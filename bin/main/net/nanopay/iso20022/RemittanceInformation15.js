// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "RemittanceInformation15",
	documentation: "Information supplied to enable the matching/reconciliation of an entry with the items that the payment is intended to settle, such as commercial invoices in an accounts' receivable system.",
	properties: [
		{
			class: "StringArray",
			name: "Unstructured",
			shortName: "Ustrd",
			documentation: "Information supplied to enable the matching/reconciliation of an entry with the items that the payment is intended to settle, such as commercial invoices in an accounts' receivable system, in an unstructured form.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Structured",
			shortName: "Strd",
			documentation: "Information supplied to enable the matching/reconciliation of an entry with the items that the payment is intended to settle, such as commercial invoices in an accounts' receivable system, in a structured form.",
			of: "net.nanopay.iso20022.StructuredRemittanceInformation15",
			required: false
		}
	]
});