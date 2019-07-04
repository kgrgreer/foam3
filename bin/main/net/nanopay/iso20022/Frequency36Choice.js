// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Frequency36Choice",
	documentation: "Choice of format for a frequency, for example, the frequency of payment.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Tp",
			shortName: "Tp",
			of: "net.nanopay.iso20022.Frequency6Code",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "Prd",
			shortName: "Prd",
			of: "net.nanopay.iso20022.FrequencyPeriod1",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "PtInTm",
			shortName: "PtInTm",
			of: "net.nanopay.iso20022.FrequencyAndMoment1",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});