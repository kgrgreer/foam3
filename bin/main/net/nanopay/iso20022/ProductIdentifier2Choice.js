// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ProductIdentifier2Choice",
	documentation: "Identifies a product in coded form or free text.",
	properties: [
		{
			class: "FObjectProperty",
			name: "StrdPdctIdr",
			shortName: "StrdPdctIdr",
			of: "net.nanopay.iso20022.ProductIdentifier2",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "OthrPdctIdr",
			shortName: "OthrPdctIdr",
			of: "net.nanopay.iso20022.GenericIdentification4",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});