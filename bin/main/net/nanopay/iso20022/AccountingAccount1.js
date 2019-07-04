// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "AccountingAccount1",
	documentation: "Specific trade account for recording debits and credits to general accounting, cost accounting or budget accounting.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique and unambiguous identification for the account between the account owner and the account servicer.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "CostReferencePattern",
			shortName: "CostRefPttrn",
			documentation: "Template describing the mask of the structure for the format of the accounting account identifier for example AABBBBCC where AA represents the country, BBBB the service classification, CC the sales area.",
			required: false
		}
	]
});