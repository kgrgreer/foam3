// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PersonIdentification13",
	documentation: "Unique and unambiguous way to identify a person.",
	properties: [
		{
			class: "FObjectProperty",
			name: "DateAndPlaceOfBirth",
			shortName: "DtAndPlcOfBirth",
			documentation: "Date and place of birth of a person.",
			of: "net.nanopay.iso20022.DateAndPlaceOfBirth1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Other",
			shortName: "Othr",
			documentation: "Unique identification of a person, as assigned by an institution, using an identification scheme.",
			of: "net.nanopay.iso20022.GenericPersonIdentification1",
			required: false
		}
	]
});