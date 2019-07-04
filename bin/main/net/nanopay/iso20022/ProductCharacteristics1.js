// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ProductCharacteristics1",
	documentation: "Identifies the characteristic of a product.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of product characteristic by means of a code.",
			of: "net.nanopay.iso20022.ProductCharacteristics1Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Characteristics",
			shortName: "Chrtcs",
			documentation: "Specifies the characteristic of a product.",
			required: false
		}
	]
});