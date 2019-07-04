// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Incoterms3",
	documentation: "Specifies the applicable Incoterm and associated location.",
	properties: [
		{
			class: "FObjectProperty",
			name: "IncotermsCode",
			shortName: "IncotrmsCd",
			documentation: "Specifies the Incoterms.",
			of: "net.nanopay.iso20022.Incoterms4Choice",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Location",
			shortName: "Lctn",
			documentation: "Location where the Incoterms are actioned. Reference UN/ECE Recommendation 16 - LOCODE - Code for Trade and Transport Locations (www.unece.org/cefact/recommendations).",
			required: false
		}
	]
});