// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PartyIdentification125",
	documentation: "Set of elements used to identify a person or an organisation.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name by which a party is known and which is usually used to identify that party.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PostalAddress",
			shortName: "PstlAdr",
			documentation: "Information that locates and identifies a specific address, as defined by postal services.",
			of: "net.nanopay.iso20022.PostalAddress6",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique and unambiguous identification of a party.",
			of: "net.nanopay.iso20022.Party34Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.CountryCode",
			name: "CountryOfResidence",
			shortName: "CtryOfRes",
			documentation: "Country in which a person resides (the place of a person's home). In the case of a company, it is the country from which the affairs of that company are directed.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ContactDetails",
			shortName: "CtctDtls",
			documentation: "Set of elements used to indicate how to contact the party.",
			of: "net.nanopay.iso20022.ContactDetails2",
			required: false
		}
	]
});