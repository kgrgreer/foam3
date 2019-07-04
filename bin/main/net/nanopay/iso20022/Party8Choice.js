// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Party8Choice",
	documentation: "Nature or use of the account.",
	properties: [
		{
			class: "FObjectProperty",
			name: "OrgId",
			shortName: "OrgId",
			of: "net.nanopay.iso20022.OrganisationIdentification6",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "PrvtId",
			shortName: "PrvtId",
			of: "net.nanopay.iso20022.PersonIdentification5",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});