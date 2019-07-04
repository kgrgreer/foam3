// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "StructuredRegulatoryReporting3",
	documentation: "Information needed due to regulatory and statutory requirements.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of the information supplied in the regulatory reporting details.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "Date",
			shortName: "Dt",
			documentation: "Date related to the specified type of regulatory reporting details.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.CountryCode",
			name: "Country",
			shortName: "Ctry",
			documentation: "Country related to the specified type of regulatory reporting details.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max10Text",
			name: "Code",
			shortName: "Cd",
			documentation: "Specifies the nature, purpose, and reason for the transaction to be reported for regulatory and statutory requirements in a coded form.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Amount",
			shortName: "Amt",
			documentation: "Amount of money to be reported for regulatory and statutory requirements.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "StringArray",
			name: "Information",
			shortName: "Inf",
			documentation: "Additional details that cater for specific domestic regulatory requirements.",
			required: false
		}
	]
});