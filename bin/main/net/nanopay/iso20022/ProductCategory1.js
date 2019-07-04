// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ProductCategory1",
	documentation: "Specifies the category of the product.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of product category by means of a code.",
			of: "net.nanopay.iso20022.ProductCategory1Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Category",
			shortName: "Ctgy",
			documentation: "Specifies the category of a product.",
			required: false
		}
	]
});