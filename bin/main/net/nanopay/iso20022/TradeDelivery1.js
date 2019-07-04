// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TradeDelivery1",
	documentation: "Specifies how the supply chain shipping arrangements and the delivery of products and/or services as well as related documentation.",
	properties: [
		{
			class: "FObjectProperty",
			name: "DeliveryPeriod",
			shortName: "DlvryPrd",
			documentation: "Actual delivery period of the products and/or services.",
			of: "net.nanopay.iso20022.Period1",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "DeliveryDateTime",
			shortName: "DlvryDtTm",
			documentation: "Actual delivery date/time of the products and/or services.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ShipFrom",
			shortName: "ShipFr",
			documentation: "Party from whom the goods are dispatched.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ShipTo",
			shortName: "ShipTo",
			documentation: "Party to whom the goods are dispatched.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "UltimateShipTo",
			shortName: "UltmtShipTo",
			documentation: "Final party to whom the goods are dispatched.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "DeliveryNote",
			shortName: "DlvryNote",
			documentation: "Delivery note related to the delivery of the products and/or services.",
			of: "net.nanopay.iso20022.DocumentIdentification22",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Consignment",
			shortName: "Consgnmt",
			documentation: "Physical consolidation of goods for transport.",
			of: "net.nanopay.iso20022.Consignment2",
			required: false
		}
	]
});