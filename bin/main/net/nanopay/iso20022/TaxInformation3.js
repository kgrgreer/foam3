// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxInformation3",
	documentation: "Details about tax paid, or to be paid, to the government in accordance with the law, including pre-defined parameters such as thresholds and type of account.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Creditor",
			shortName: "Cdtr",
			documentation: "Party on the credit side of the transaction to which the tax applies.",
			of: "net.nanopay.iso20022.TaxParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Debtor",
			shortName: "Dbtr",
			documentation: "Set of elements used to identify the party on the debit side of the transaction to which the tax applies.",
			of: "net.nanopay.iso20022.TaxParty2",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "AdministrationZone",
			shortName: "AdmstnZn",
			documentation: "Territorial part of a country to which the tax payment is related.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "ReferenceNumber",
			shortName: "RefNb",
			documentation: "Tax reference information that is specific to a taxing agency.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "Method",
			shortName: "Mtd",
			documentation: "Method used to indicate the underlying business or how the tax is paid.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TotalTaxableBaseAmount",
			shortName: "TtlTaxblBaseAmt",
			documentation: "Total amount of money on which the tax is based.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TotalTaxAmount",
			shortName: "TtlTaxAmt",
			documentation: "Total amount of money as result of the calculation of the tax.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "Date",
			shortName: "Dt",
			documentation: "Date by which tax is due.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Number",
			name: "SequenceNumber",
			shortName: "SeqNb",
			documentation: "Sequential number of the tax report.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Record",
			shortName: "Rcrd",
			documentation: "Record of tax details.",
			of: "net.nanopay.iso20022.TaxRecord1",
			required: false
		}
	]
});