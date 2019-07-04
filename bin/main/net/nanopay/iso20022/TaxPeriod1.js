// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxPeriod1",
	documentation: "Period of time details related to the tax payment.",
	properties: [
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "Year",
			shortName: "Yr",
			documentation: "Year related to the tax payment.",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "Type",
			shortName: "Tp",
			documentation: "Identification of the period related to the tax payment.",
			of: "net.nanopay.iso20022.TaxRecordPeriod1Code",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "FromToDate",
			shortName: "FrToDt",
			documentation: "Range of time between a start date and an end date for which the tax report is provided.",
			of: "net.nanopay.iso20022.DatePeriodDetails",
			required: false
		}
	]
});