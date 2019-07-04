// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "MandateRelatedInformation11",
	documentation: "Provides further details related to a direct debit mandate signed between the creditor and the debtor.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "MandateIdentification",
			shortName: "MndtId",
			documentation: "Unique identification, as assigned by the creditor, to unambiguously identify the mandate.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "DateOfSignature",
			shortName: "DtOfSgntr",
			documentation: "Date on which the direct debit mandate has been signed by the debtor.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.TrueFalseIndicator",
			name: "AmendmentIndicator",
			shortName: "AmdmntInd",
			documentation: "Indicator notifying whether the underlying mandate is amended or not.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "AmendmentInformationDetails",
			shortName: "AmdmntInfDtls",
			documentation: "List of mandate elements that have been modified.",
			of: "net.nanopay.iso20022.AmendmentInformationDetails11",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max1025Text",
			name: "ElectronicSignature",
			shortName: "ElctrncSgntr",
			documentation: "Additional security provisions, such as a digital signature, as provided by the debtor.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "FirstCollectionDate",
			shortName: "FrstColltnDt",
			documentation: "Date of the first collection of a direct debit as per the mandate.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "FinalCollectionDate",
			shortName: "FnlColltnDt",
			documentation: "Date of the final collection of a direct debit as per the mandate.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Frequency",
			shortName: "Frqcy",
			documentation: "Regularity with which direct debit instructions are to be created and processed.",
			of: "net.nanopay.iso20022.Frequency36Choice",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Reason",
			shortName: "Rsn",
			documentation: "Reason for the direct debit mandate to allow the user to distinguish between different mandates for the same creditor.",
			of: "net.nanopay.iso20022.MandateSetupReason1Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Exact2NumericText",
			name: "TrackingDays",
			shortName: "TrckgDays",
			documentation: "Specifies the number of days the direct debit instruction must be tracked.",
			required: false
		}
	]
});