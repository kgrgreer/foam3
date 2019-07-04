// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Quantity4",
	documentation: "Specifies the quantity of a product in a trade transaction.",
	properties: [
		{
			class: "net.nanopay.iso20022.DecimalNumber",
			name: "Value",
			shortName: "Val",
			documentation: "Quantity of a product on a line specified by a number. For example, 100 (kgs), 50 (pieces).",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max15NumericText",
			name: "Factor",
			shortName: "Fctr",
			documentation: "Multiplication factor of measurement values. For example: goods that can be ordered by 36 pieces.",
			required: false
		}
	]
});