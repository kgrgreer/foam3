// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DateFormat4Choice",
	documentation: "Specifies the value of a date.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Dt",
			shortName: "Dt",
			of: "net.nanopay.iso20022.DateAndDateTimeChoice",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "foam.core.Enum",
			name: "NotSpcfdDt",
			shortName: "NotSpcfdDt",
			of: "net.nanopay.iso20022.DateType6Code",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "Prtry",
			shortName: "Prtry",
			of: "net.nanopay.iso20022.GenericIdentification13",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});