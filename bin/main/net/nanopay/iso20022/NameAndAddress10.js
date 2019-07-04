// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "NameAndAddress10",
	documentation: "Information that locates and identifies a party.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name by which a party is known and is usually used to identify that party.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Address",
			shortName: "Adr",
			documentation: "Postal address of a party.",
			of: "net.nanopay.iso20022.PostalAddress6",
			required: false
		}
	]
});