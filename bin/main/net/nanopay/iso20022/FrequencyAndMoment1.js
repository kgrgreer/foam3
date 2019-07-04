// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "FrequencyAndMoment1",
	documentation: "Defines a frequency in terms a specific moment within a specified period type.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Type",
			shortName: "Tp",
			documentation: "Period for which the number of instructions are to be created and processed.",
			of: "net.nanopay.iso20022.Frequency6Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Exact2NumericText",
			name: "PointInTime",
			shortName: "PtInTm",
			documentation: "Further information on the exact point in time the event should take place.",
			required: false
		}
	]
});