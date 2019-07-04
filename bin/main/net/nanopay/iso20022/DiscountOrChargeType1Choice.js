// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DiscountOrChargeType1Choice",
	documentation: "Choice between a type of discount or a type of charge.",
	properties: [
		{
			class: "FObjectProperty",
			name: "ChrgTp",
			shortName: "ChrgTp",
			of: "net.nanopay.iso20022.ChargeTypeFormat3Choice",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "DscntTp",
			shortName: "DscntTp",
			of: "net.nanopay.iso20022.DiscountTypeFormat1Choice",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});