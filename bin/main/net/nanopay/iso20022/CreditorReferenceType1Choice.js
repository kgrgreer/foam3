// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CreditorReferenceType1Choice",
	documentation: "Specifies the type of document referred by the creditor.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Cd",
			shortName: "Cd",
			of: "net.nanopay.iso20022.DocumentType3Code",
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