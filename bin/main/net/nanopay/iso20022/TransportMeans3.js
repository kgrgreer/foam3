// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TransportMeans3",
	documentation: "Describes the multimodal or the individual transport of goods.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max4Text",
			name: "ModeCode",
			shortName: "MdCd",
			documentation: "Code specifying the transport mode for the delivery of the consignment, such as by air, sea, rail, road or inland waterway. Reference UN/ECE Recommendation 19 - Code for Modes of Transport (www.unece.org/cefact/recommendations).",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique identification of the means of transport, such as the International Maritime Organization number of a vessel.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Name",
			shortName: "Nm",
			documentation: "Name, expressed as text, of the means of transport.",
			required: false
		}
	]
});