// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TradeParty1",
	documentation: "Specifies an entity involved in a trade activity.",
	properties: [
		{
			class: "FObjectProperty",
			name: "PartyIdentification",
			shortName: "PtyId",
			documentation: "Unique identification, as assigned by an organisation, to unambiguously identify a party.",
			of: "net.nanopay.iso20022.PartyIdentification45",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "LegalOrganisation",
			shortName: "LglOrg",
			documentation: "Legally constituted organization specified for this trade party.",
			of: "net.nanopay.iso20022.LegalOrganisation1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TaxParty",
			shortName: "TaxPty",
			documentation: "Entity involved in an activity.",
			of: "net.nanopay.iso20022.TaxParty3",
			required: false
		}
	]
});