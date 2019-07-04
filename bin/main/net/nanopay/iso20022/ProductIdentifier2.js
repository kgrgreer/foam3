// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ProductIdentifier2",
	documentation: "Information used to identify a product.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of product identifier by means of a code.",
			of: "net.nanopay.iso20022.ProductIdentifier2Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identifier",
			shortName: "Idr",
			documentation: "Specifies the product identifier.",
			required: false
		}
	]
});