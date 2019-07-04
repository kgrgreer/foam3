// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "LocalInstrument2Choice",
	documentation: "Set of elements that further identifies the type of local instruments being requested by the initiating party.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalLocalInstrument1Code",
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