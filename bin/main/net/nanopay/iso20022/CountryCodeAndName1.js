// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CountryCodeAndName1",
	documentation: "Specifies a country by its code or its name.",
	properties: [
		{
			class: "net.nanopay.iso20022.CountryCode",
			name: "Code",
			shortName: "Cd",
			documentation: "Country is specified by its code.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Country is specified by its name.",
			required: false
		}
	]
});