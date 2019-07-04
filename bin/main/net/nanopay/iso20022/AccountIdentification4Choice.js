// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "AccountIdentification4Choice",
	documentation: "Specifies the unique identification of an account as assigned by the account servicer.",
	properties: [
		{
			class: "net.nanopay.iso20022.IBAN2007Identifier",
			name: "IBAN",
			shortName: "IBAN",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "Othr",
			shortName: "Othr",
			of: "net.nanopay.iso20022.GenericAccountIdentification1",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});