// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "BranchAndFinancialInstitutionIdentification4",
	documentation: "Set of elements used to uniquely and unambiguously identify a financial institution or a branch of a financial institution.",
	properties: [
		{
			class: "FObjectProperty",
			name: "FinancialInstitutionIdentification",
			shortName: "FinInstnId",
			documentation: "Unique and unambiguous identification of a financial institution, as assigned under an internationally recognised or proprietary identification scheme.",
			of: "net.nanopay.iso20022.FinancialInstitutionIdentification7",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "BranchIdentification",
			shortName: "BrnchId",
			documentation: `Identifies a specific branch of a financial institution.

Usage: This component should be used in case the identification information in the financial institution component does not provide identification up to branch level.`,
			of: "net.nanopay.iso20022.BranchData2",
			required: false
		}
	]
});