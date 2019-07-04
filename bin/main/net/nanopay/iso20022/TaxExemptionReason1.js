// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxExemptionReason1",
	documentation: "Specification of the tax exemption reason.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Structured",
			shortName: "Strd",
			documentation: "Structured format.",
			of: "net.nanopay.iso20022.TaxExemptReason2Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max350Text",
			name: "AdditionalInformation",
			shortName: "AddtlInf",
			documentation: "Additional information about the type of tax.",
			required: false
		}
	]
});