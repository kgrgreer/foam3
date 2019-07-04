// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "SupplementaryData1",
	documentation: "Additional information that can not be captured in the structured fields and/or any other specific block.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max350Text",
			name: "PlaceAndName",
			shortName: "PlcAndNm",
			documentation: `Unambiguous reference to the location where the supplementary data must be inserted in the message instance.
In the case of XML, this is expressed by a valid XPath.`,
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Envelope",
			shortName: "Envlp",
			documentation: "Technical element wrapping the supplementary data.",
			of: "net.nanopay.iso20022.SupplementaryDataEnvelope1",
			required: false
		}
	]
});