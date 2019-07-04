// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "AmendmentInformationDetails11",
	documentation: "Provides further details on the list of direct debit mandate elements that have been modified when the amendment indicator has been set.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalMandateIdentification",
			shortName: "OrgnlMndtId",
			documentation: "Unique identification, as assigned by the creditor, to unambiguously identify the original mandate.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalCreditorSchemeIdentification",
			shortName: "OrgnlCdtrSchmeId",
			documentation: "Original creditor scheme identification that has been modified.",
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalCreditorAgent",
			shortName: "OrgnlCdtrAgt",
			documentation: "Original creditor agent that has been modified.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalCreditorAgentAccount",
			shortName: "OrgnlCdtrAgtAcct",
			documentation: "Original creditor agent account that has been modified.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalDebtor",
			shortName: "OrgnlDbtr",
			documentation: "Original debtor that has been modified.",
			of: "net.nanopay.iso20022.PartyIdentification43",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalDebtorAccount",
			shortName: "OrgnlDbtrAcct",
			documentation: "Original debtor account that has been modified.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalDebtorAgent",
			shortName: "OrgnlDbtrAgt",
			documentation: "Original debtor agent that has been modified.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalDebtorAgentAccount",
			shortName: "OrgnlDbtrAgtAcct",
			documentation: "Original debtor agent account that has been modified.",
			of: "net.nanopay.iso20022.CashAccount24",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "OriginalFinalCollectionDate",
			shortName: "OrgnlFnlColltnDt",
			documentation: "Original final collection date that has been modified.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalFrequency",
			shortName: "OrgnlFrqcy",
			documentation: "Original frequency that has been modified.",
			of: "net.nanopay.iso20022.Frequency36Choice",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "OriginalReason",
			shortName: "OrgnlRsn",
			documentation: "Original reason for the mandate to allow the user to distinguish between different mandates for the same creditor.",
			of: "net.nanopay.iso20022.MandateSetupReason1Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Exact2NumericText",
			name: "OriginalTrackingDays",
			shortName: "OrgnlTrckgDays",
			documentation: "Original number of tracking days that has been modified.",
			required: false
		}
	]
});