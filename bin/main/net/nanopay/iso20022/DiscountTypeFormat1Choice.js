// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DiscountTypeFormat1Choice",
	documentation: "Choice between a standard code or a proprietary code for specifying the type of discount.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Cd",
			shortName: "Cd",
			of: "net.nanopay.iso20022.DiscountType1Code",
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