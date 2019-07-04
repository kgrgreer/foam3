// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Authorisation1Choice",
	documentation: "Provides the details on the user identification or any user key that allows to check if the initiating party is allowed to issue the transaction.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Cd",
			shortName: "Cd",
			of: "net.nanopay.iso20022.Authorisation1Code",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "net.nanopay.iso20022.Max128Text",
			name: "Prtry",
			shortName: "Prtry",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});