// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TradeAgreement6",
	documentation: "Contractual details related to the agreement between parties.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Buyer",
			shortName: "Buyr",
			documentation: "Party that is specified as the buyer for this trade agreement.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Seller",
			shortName: "Sellr",
			documentation: "Party that is specified as the seller for this trade agreement.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "QuotationDocumentIdentification",
			shortName: "QtnDocId",
			documentation: "Quotation document referenced from this trade agreement.",
			of: "net.nanopay.iso20022.DocumentIdentification22",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ContractDocumentIdentification",
			shortName: "CtrctDocId",
			documentation: "Contract document referenced from this trade agreement.",
			of: "net.nanopay.iso20022.DocumentIdentification22",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "BuyerOrderIdentificationDocument",
			shortName: "BuyrOrdrIdDoc",
			documentation: "Buyer order document referenced from this trade agreement.",
			of: "net.nanopay.iso20022.DocumentIdentification22",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AdditionalReferenceDocument",
			shortName: "AddtlRefDoc",
			documentation: "Additional document referenced from this trade agreement.",
			of: "net.nanopay.iso20022.DocumentGeneralInformation2",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Incoterms",
			shortName: "Incotrms",
			documentation: "Specifies the applicable Incoterm and associated location.",
			of: "net.nanopay.iso20022.Incoterms3",
			required: false
		}
	]
});