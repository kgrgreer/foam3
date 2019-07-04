// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Packaging1",
	documentation: "Physical packaging of goods for transport.",
	properties: [
		{
			class: "net.nanopay.iso20022.ExternalPackagingType1Code",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of packaging as a code.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Specifies the type of packaging as text. For instance, halogenated resin (PVC).",
			required: false
		}
	]
});