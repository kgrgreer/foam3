// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "AmountType4Choice",
	documentation: "Specifies the amount of money to be moved between the debtor and creditor, before deduction of charges, expressed in the currency as ordered by the initiating party.",
	properties: [
		{
			class: "FObjectProperty",
			name: "InstdAmt",
			shortName: "InstdAmt",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "FObjectProperty",
			name: "EqvtAmt",
			shortName: "EqvtAmt",
			of: "net.nanopay.iso20022.EquivalentAmount2",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});