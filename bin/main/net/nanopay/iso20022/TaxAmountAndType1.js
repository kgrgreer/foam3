// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TaxAmountAndType1",
	documentation: "Specifies the amount with a specific type.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of the amount.",
			of: "net.nanopay.iso20022.TaxAmountType1Choice",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Amount",
			shortName: "Amt",
			documentation: "Amount of money, which has been typed.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		}
	]
});