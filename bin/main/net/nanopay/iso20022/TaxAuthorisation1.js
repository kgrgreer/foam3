// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxAuthorisation1",
	documentation: "Details of the authorised tax paying party.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Title",
			shortName: "Titl",
			documentation: "Title or position of debtor or the debtor's authorised representative.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name of the debtor or the debtor's authorised representative.",
			required: false
		}
	]
});