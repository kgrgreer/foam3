// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "EquivalentAmount2",
	documentation: "Amount of money to be moved between the debtor and creditor, expressed in the currency of the debtor's account, and the currency in which the amount is to be moved.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Amount",
			shortName: "Amt",
			documentation: `Amount of money to be moved between debtor and creditor, before deduction of charges, expressed in the currency of the debtor's account, and to be moved in a different currency.
Usage: The first agent will convert the equivalent amount into the amount to be moved.`,
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ActiveOrHistoricCurrencyCode",
			name: "CurrencyOfTransfer",
			shortName: "CcyOfTrf",
			documentation: "Specifies the currency of the to be transferred amount, which is different from the currency of the debtor's account.",
			required: false
		}
	]
});