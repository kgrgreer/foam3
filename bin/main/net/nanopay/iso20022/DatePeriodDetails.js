// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DatePeriodDetails",
	documentation: "Range of time defined by a start date and an end date.",
	properties: [
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "FromDate",
			shortName: "FrDt",
			documentation: "Start date of the range.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "ToDate",
			shortName: "ToDt",
			documentation: "End date of the range.",
			required: false
		}
	]
});