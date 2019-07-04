// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Incoterms4Choice",
	documentation: "Specifies the applicable Incoterm and associated location.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalIncoterms1Code",
			name: "Cd",
			shortName: "Cd",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "Prtry",
			shortName: "Prtry",
			of: "net.nanopay.iso20022.GenericIdentification13",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});