// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CreditorReferenceInformation2",
	documentation: "Reference information provided by the creditor to allow the identification of the underlying documents.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of creditor reference.",
			of: "net.nanopay.iso20022.CreditorReferenceType2",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Reference",
			shortName: "Ref",
			documentation: `Unique reference, as assigned by the creditor, to unambiguously refer to the payment transaction.

Usage: If available, the initiating party should provide this reference in the structured remittance information, to enable reconciliation by the creditor upon receipt of the amount of money.

If the business context requires the use of a creditor reference or a payment remit identification, and only one identifier can be passed through the end-to-end chain, the creditor's reference or payment remittance identification should be quoted in the end-to-end transaction identification.`,
			required: false
		}
	]
});