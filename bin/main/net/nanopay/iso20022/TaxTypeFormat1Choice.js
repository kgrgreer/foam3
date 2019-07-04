// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxTypeFormat1Choice",
	documentation: "Choice of formats to express the type of taxes.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Cd",
			shortName: "Cd",
			of: "net.nanopay.iso20022.TaxType15Code",
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