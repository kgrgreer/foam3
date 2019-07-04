// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DocumentAdjustment1",
	documentation: "Set of elements used to provide information on the amount and reason of the document adjustment.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Amount",
			shortName: "Amt",
			documentation: "Amount of money of the document adjustment.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "CreditDebitIndicator",
			shortName: "CdtDbtInd",
			documentation: "Specifies whether the adjustment must be subtracted or added to the total amount.",
			of: "net.nanopay.iso20022.CreditDebitCode",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max4Text",
			name: "Reason",
			shortName: "Rsn",
			documentation: "Specifies the reason for the adjustment.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "AdditionalInformation",
			shortName: "AddtlInf",
			documentation: "Provides further details on the document adjustment.",
			required: false
		}
	]
});