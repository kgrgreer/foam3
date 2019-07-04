// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Period1",
	documentation: "Time span defined by a start date and time, and an end date and time.",
	properties: [
		{
			class: "FObjectProperty",
			name: "StartDate",
			shortName: "StartDt",
			documentation: "Date and time at which the range starts.",
			of: "net.nanopay.iso20022.DateFormat4Choice",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "EndDate",
			shortName: "EndDt",
			documentation: "Date and time at which the range ends.",
			of: "net.nanopay.iso20022.DateFormat4Choice",
			required: false
		}
	]
});