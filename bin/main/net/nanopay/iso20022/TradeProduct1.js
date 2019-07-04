// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TradeProduct1",
	documentation: "Tangible output or service produced by human or mechanical effort, or by a natural process for purposes of specifying a product.",
	properties: [
		{
			class: "FObjectArray",
			name: "Identification",
			shortName: "Id",
			documentation: "Identification of the product.",
			of: "net.nanopay.iso20022.ProductIdentifier2Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name of a product.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Description",
			shortName: "Desc",
			documentation: "Information about the goods and/or services of a trade transaction.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "CountryOfOrigin",
			shortName: "CtryOfOrgn",
			documentation: "Country of origin of the product.",
			of: "net.nanopay.iso20022.CountryCodeAndName1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ProductCharacteristics",
			shortName: "PdctChrtcs",
			documentation: "Identifies the characteristic of a product.",
			of: "net.nanopay.iso20022.ProductCharacteristics2",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ProductCategory",
			shortName: "PdctCtgy",
			documentation: "Category of the product.",
			of: "net.nanopay.iso20022.ProductCategory1Choice",
			required: false
		},
		{
			class: "StringArray",
			name: "GlobalSerialIdentifier",
			shortName: "GblSrlIdr",
			documentation: "Unique global serial identifier for this product instance.",
			required: false
		}
	]
});