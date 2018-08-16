foam.CLASS({
	package: "net.nanopay.fx.model",
	name: "FXHoldingAccount",
	properties: [
		{
			class: "foam.core.String",
			name: "AccountCurrencyID"
		},
		{
			class: "foam.core.String",
			name: "AccountNumber"
		},
		{
			class: "foam.core.Float",
			name: "BalanceAmount",
			required: false
		}
	]
});
