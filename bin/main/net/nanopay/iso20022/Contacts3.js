// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Contacts3",
	documentation: "Address for electronic mail (e-mail).",
	properties: [
		{
			class: "foam.core.Enum",
			name: "NamePrefix",
			shortName: "NmPrfx",
			documentation: "Specifies the terms used to formally address a person.",
			of: "net.nanopay.iso20022.NamePrefix1Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name by which a party is known and which is usually used to identify that party.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PhoneNumber",
			name: "PhoneNumber",
			shortName: "PhneNb",
			documentation: "Collection of information that identifies a phone number, as defined by telecom services.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PhoneNumber",
			name: "MobileNumber",
			shortName: "MobNb",
			documentation: "Collection of information that identifies a phone number, as defined by telecom services.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PhoneNumber",
			name: "FaxNumber",
			shortName: "FaxNb",
			documentation: "Collection of information that identifies a FAX number, as defined by telecom services.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max2048Text",
			name: "EmailAddress",
			shortName: "EmailAdr",
			documentation: "Address for electronic mail (e-mail).",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Other",
			shortName: "Othr",
			documentation: "Contact details in another form.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "JobTitle",
			shortName: "JobTitl",
			documentation: "Title of the function.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Responsibility",
			shortName: "Rspnsblty",
			documentation: "Role of a person in an organisation.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max70Text",
			name: "Department",
			shortName: "Dept",
			documentation: "Identification of a division of a large organisation or building.",
			required: false
		}
	]
});