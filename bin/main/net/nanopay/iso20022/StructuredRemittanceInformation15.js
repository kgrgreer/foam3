// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "StructuredRemittanceInformation15",
	documentation: "Information supplied to enable the matching/reconciliation of an entry with the items that the payment is intended to settle, such as commercial invoices in an accounts' receivable system, in a structured form.",
	properties: [
		{
			class: "FObjectArray",
			name: "ReferredDocumentInformation",
			shortName: "RfrdDocInf",
			documentation: "Provides the identification and the content of the referred document.",
			of: "net.nanopay.iso20022.ReferredDocumentInformation7",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ReferredDocumentAmount",
			shortName: "RfrdDocAmt",
			documentation: "Provides details on the amounts of the referred document.",
			of: "net.nanopay.iso20022.RemittanceAmount2",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "CreditorReferenceInformation",
			shortName: "CdtrRefInf",
			documentation: "Reference information provided by the creditor to allow the identification of the underlying documents.",
			of: "net.nanopay.iso20022.CreditorReferenceInformation2",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Invoicer",
			shortName: "Invcr",
			documentation: "Identification of the organisation issuing the invoice, when it is different from the creditor or ultimate creditor.",
			of: "net.nanopay.iso20022.PartyIdentification125",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Invoicee",
			shortName: "Invcee",
			documentation: "Identification of the party to whom an invoice is issued, when it is different from the debtor or ultimate debtor.",
			of: "net.nanopay.iso20022.PartyIdentification125",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TaxRemittance",
			shortName: "TaxRmt",
			documentation: "Provides remittance information about a payment made for tax-related purposes.",
			of: "net.nanopay.iso20022.TaxInformation7",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "GarnishmentRemittance",
			shortName: "GrnshmtRmt",
			documentation: "Provides remittance information about a payment for garnishment-related purposes.",
			of: "net.nanopay.iso20022.Garnishment2",
			required: false
		},
		{
			class: "StringArray",
			name: "AdditionalRemittanceInformation",
			shortName: "AddtlRmtInf",
			documentation: "Additional information, in free text form, to complement the structured remittance information.",
			required: false
		}
	]
});