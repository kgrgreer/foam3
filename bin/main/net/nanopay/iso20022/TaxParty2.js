// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxParty2",
	documentation: "Details about the entity involved in the tax paid or to be paid.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "TaxIdentification",
			shortName: "TaxId",
			documentation: "Tax identification number of the debtor.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "RegistrationIdentification",
			shortName: "RegnId",
			documentation: "Unique identification, as assigned by an organisation, to unambiguously identify a party.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "TaxType",
			shortName: "TaxTp",
			documentation: "Type of tax payer.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Authorisation",
			shortName: "Authstn",
			documentation: "Details of the authorised tax paying party.",
			of: "net.nanopay.iso20022.TaxAuthorisation1",
			required: false
		}
	]
});