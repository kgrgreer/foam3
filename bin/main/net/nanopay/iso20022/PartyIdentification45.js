// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PartyIdentification45",
	documentation: "Set of elements used to identify a person or an organisation.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique identification, as assigned by an organisation, to unambiguously identify a party.",
			of: "net.nanopay.iso20022.Party8Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name by which a party is known and which is usually used to identify that party.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PostalAddress",
			shortName: "PstlAdr",
			documentation: "Information that locates and identifies a specific address.",
			of: "net.nanopay.iso20022.PostalAddress6",
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
			class: "FObjectArray",
			name: "ContactDetails",
			shortName: "CtctDtls",
			documentation: "Contact defined for this party.",
			of: "net.nanopay.iso20022.Contacts3",
			required: false
		}
	]
});