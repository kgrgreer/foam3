// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "OrganisationIdentificationSchemeName1Choice",
	documentation: "Sets of elements to identify a name of the organisation identification scheme.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalOrganisationIdentification1Code",
			name: "Cd",
			shortName: "Cd",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Prtry",
			shortName: "Prtry",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});