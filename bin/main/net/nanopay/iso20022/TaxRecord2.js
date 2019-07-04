// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxRecord2",
	documentation: "Set of elements used to define the tax record.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Type",
			shortName: "Tp",
			documentation: "High level code to identify the type of tax details.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Category",
			shortName: "Ctgy",
			documentation: "Specifies the tax code as published by the tax authority.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "CategoryDetails",
			shortName: "CtgyDtls",
			documentation: "Provides further details of the category tax code.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "DebtorStatus",
			shortName: "DbtrSts",
			documentation: "Code provided by local authority to identify the status of the party that has drawn up the settlement document.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "CertificateIdentification",
			shortName: "CertId",
			documentation: "Identification number of the tax report as assigned by the taxing authority.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "FormsCode",
			shortName: "FrmsCd",
			documentation: "Identifies, in a coded form, on which template the tax report is to be provided.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Period",
			shortName: "Prd",
			documentation: "Set of elements used to provide details on the period of time related to the tax payment.",
			of: "net.nanopay.iso20022.TaxPeriod2",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TaxAmount",
			shortName: "TaxAmt",
			documentation: "Set of elements used to provide information on the amount of the tax record.",
			of: "net.nanopay.iso20022.TaxAmount2",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "AdditionalInformation",
			shortName: "AddtlInf",
			documentation: "Further details of the tax record.",
			required: false
		}
	]
});