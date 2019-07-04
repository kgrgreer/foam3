// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Consignment2",
	documentation: "Specifies the arrangement of the transport of goods and services and the parties involved in this process.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Consignor",
			shortName: "Consgnr",
			documentation: "Party consigning goods as stipulated in the transport contract by the party ordering transport.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Consignee",
			shortName: "Consgn",
			documentation: "Party to which goods are consigned.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TransportMeans",
			shortName: "TrnsprtMeans",
			documentation: "Particular aircraft, vehicle, vessel or other device used for the transport of a consignment.",
			of: "net.nanopay.iso20022.TransportMeans3",
			required: false
		}
	]
});