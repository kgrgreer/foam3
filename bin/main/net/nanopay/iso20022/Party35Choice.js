// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Party35Choice",
	documentation: "Identification of a person, an organisation or a financial institution.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Pty",
			shortName: "Pty",
			of: "net.nanopay.iso20022.PartyIdentification125",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "Agt",
			shortName: "Agt",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});