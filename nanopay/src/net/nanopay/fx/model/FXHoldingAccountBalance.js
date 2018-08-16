foam.CLASS({
	package: "net.nanopay.fx.model",
	name: "FXHoldingAccountBalance",
	properties: [
		{
			class: "FObjectArray",
			name: "fxHoldingAccounts",
			of: "net.nanopay.fx.model.FXHoldingAccount"
		}
	]
});
