// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ProductCategory1Choice",
	documentation: "Specifies that the category of a product may be indicated by a code or by free text.",
	properties: [
		{
			class: "FObjectProperty",
			name: "StrdPdctCtgy",
			shortName: "StrdPdctCtgy",
			of: "net.nanopay.iso20022.ProductCategory1",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "OthrPdctCtgy",
			shortName: "OthrPdctCtgy",
			of: "net.nanopay.iso20022.GenericIdentification4",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});