// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "GarnishmentType1Choice",
	documentation: "Specifies the type of garnishment.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalGarnishmentType1Code",
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