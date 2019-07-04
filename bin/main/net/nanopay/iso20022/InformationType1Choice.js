// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "InformationType1Choice",
	documentation: "Specifies the type of additional information.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Cd",
			shortName: "Cd",
			of: "net.nanopay.iso20022.InformationType1Code",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Prtry",
			shortName: "Prtry",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});