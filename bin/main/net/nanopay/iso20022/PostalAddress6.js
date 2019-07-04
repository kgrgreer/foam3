// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PostalAddress6",
	documentation: "Information that locates and identifies a specific address, as defined by postal services.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "AddressType",
			shortName: "AdrTp",
			documentation: "Identifies the nature of the postal address.",
			of: "net.nanopay.iso20022.AddressType2Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max70Text",
			name: "Department",
			shortName: "Dept",
			documentation: "Identification of a division of a large organisation or building.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max70Text",
			name: "SubDepartment",
			shortName: "SubDept",
			documentation: "Identification of a sub-division of a large organisation or building.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max70Text",
			name: "StreetName",
			shortName: "StrtNm",
			documentation: "Name of a street or thoroughfare.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max16Text",
			name: "BuildingNumber",
			shortName: "BldgNb",
			documentation: "Number that identifies the position of a building on a street.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max16Text",
			name: "PostCode",
			shortName: "PstCd",
			documentation: "Identifier consisting of a group of letters and/or numbers that is added to a postal address to assist the sorting of mail.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "TownName",
			shortName: "TwnNm",
			documentation: "Name of a built-up area, with defined boundaries, and a local government.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "CountrySubDivision",
			shortName: "CtrySubDvsn",
			documentation: "Identifies a subdivision of a country such as state, region, county.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.CountryCode",
			name: "Country",
			shortName: "Ctry",
			documentation: "Nation with its own government.",
			required: false
		},
		{
			class: "StringArray",
			name: "AddressLine",
			shortName: "AdrLine",
			documentation: "Information that locates and identifies a specific address, as defined by postal services, presented in free format text.",
			required: false
		}
	]
});