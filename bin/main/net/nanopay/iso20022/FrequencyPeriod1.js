// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "FrequencyPeriod1",
	documentation: "Defines a frequency in terms on counts per period for a specific period type.",
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
			class: "net.nanopay.iso20022.DecimalNumber",
			name: "CountPerPeriod",
			shortName: "CntPerPrd",
			documentation: "Number of instructions to be created and processed during the specified period.",
			required: false
		}
	]
});