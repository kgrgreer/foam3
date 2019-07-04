// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DateAndPlaceOfBirth1",
	documentation: "Date and place of birth of a person.",
	properties: [
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "BirthDate",
			shortName: "BirthDt",
			documentation: "Date on which a person is born.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "ProvinceOfBirth",
			shortName: "PrvcOfBirth",
			documentation: "Province where a person was born.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "CityOfBirth",
			shortName: "CityOfBirth",
			documentation: "City where a person was born.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.CountryCode",
			name: "CountryOfBirth",
			shortName: "CtryOfBirth",
			documentation: "Country where a person was born.",
			required: false
		}
	]
});