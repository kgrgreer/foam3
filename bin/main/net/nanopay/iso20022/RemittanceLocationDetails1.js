// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "RemittanceLocationDetails1",
	documentation: "Provides information on the remittance advice.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Method",
			shortName: "Mtd",
			documentation: "Method used to deliver the remittance advice information.",
			of: "net.nanopay.iso20022.RemittanceLocationMethod2Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max2048Text",
			name: "ElectronicAddress",
			shortName: "ElctrncAdr",
			documentation: "Electronic address to which an agent is to send the remittance information.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PostalAddress",
			shortName: "PstlAdr",
			documentation: "Postal address to which an agent is to send the remittance information.",
			of: "net.nanopay.iso20022.NameAndAddress10",
			required: false
		}
	]
});