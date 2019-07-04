// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ProductCharacteristics2",
	documentation: "Product characteristic applicable to this trade product.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Characteristic",
			shortName: "Chrtc",
			documentation: "Characteristics of the product.",
			of: "net.nanopay.iso20022.ProductCharacteristics1Choice",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ValueMeasure",
			shortName: "ValMeasr",
			documentation: "Measurement value for this product characteristic.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		}
	]
});