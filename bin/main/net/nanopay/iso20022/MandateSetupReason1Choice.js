// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "MandateSetupReason1Choice",
	documentation: "Specifies the reason for the setup of the mandate.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalMandateSetupReason1Code",
			name: "Cd",
			shortName: "Cd",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "net.nanopay.iso20022.Max70Text",
			name: "Prtry",
			shortName: "Prtry",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});