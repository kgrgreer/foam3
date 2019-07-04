// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxExemptionReasonFormatChoice",
	documentation: "Choice between specification of the tax exemption reason in structured or free text format.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "Ustrd",
			shortName: "Ustrd",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "foam.core.Enum",
			name: "Strd",
			shortName: "Strd",
			of: "net.nanopay.iso20022.TaxExemptReason1Code",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});