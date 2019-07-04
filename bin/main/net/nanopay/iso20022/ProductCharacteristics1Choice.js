// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ProductCharacteristics1Choice",
	documentation: "Specifies that the category of a product may be indicated by a code or by free text.",
	properties: [
		{
			class: "FObjectProperty",
			name: "StrdPdctChrtcs",
			shortName: "StrdPdctChrtcs",
			of: "net.nanopay.iso20022.ProductCharacteristics1",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "OthrPdctChrtcs",
			shortName: "OthrPdctChrtcs",
			of: "net.nanopay.iso20022.GenericIdentification4",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});