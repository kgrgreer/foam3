// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "GetQuoteTBAResult",
	properties: [
		{
			class: "foam.core.Long",
			name: "ErrorCode",
			required: false
		},
		{
			class: "foam.core.String",
			name: "ErrorMessage"
		},
		{
			class: "foam.core.Double",
			name: "Fee",
			required: false
		},
		{
			class: "foam.core.String",
			name: "FromAccountNumber"
		},
		{
			class: "foam.core.Double",
			name: "FxAmount",
			required: false
		},
		{
			class: "foam.core.String",
			name: "FxCurrencyID"
		},
		{
			class: "foam.core.String",
			name: "PaymentMethod"
		},
		{
			class: "FObjectProperty",
			name: "Quote",
			of: "net.nanopay.fx.ascendantfx.model.Quote"
		},
		{
			class: "foam.core.Double",
			name: "Rate",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "SettlementAmount",
			required: false
		},
		{
			class: "foam.core.String",
			name: "SettlementCurrencyID"
		},
		{
			class: "foam.core.String",
			name: "ToAccountNumber"
		},
		{
			class: "foam.core.Double",
			name: "TotalSettlementAmount",
			required: false
		}
	]
});