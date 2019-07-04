// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "BranchData2",
	documentation: "Information that locates and identifies a specific branch of a financial institution.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique and unambiguous identification of a branch of a financial institution.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name by which an agent is known and which is usually used to identify that agent.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PostalAddress",
			shortName: "PstlAdr",
			documentation: "Information that locates and identifies a specific address, as defined by postal services.",
			of: "net.nanopay.iso20022.PostalAddress6",
			required: false
		}
	]
});