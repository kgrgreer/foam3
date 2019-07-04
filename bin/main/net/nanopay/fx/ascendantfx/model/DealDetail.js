// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.fx.ascendantfx.model",
	name: "DealDetail",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Direction",
			of: "net.nanopay.fx.ascendantfx.model.Direction",
			required: false
		},
		{
			class: "foam.core.Double",
			name: "Fee",
			required: false
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
			name: "InternalNotes"
		},
		{
			class: "foam.core.String",
			name: "NotesToPayee"
		},
		{
			class: "foam.core.String",
			name: "PaymentMethod"
		},
		{
			class: "foam.core.Int",
			name: "PaymentSequenceNo",
			required: false
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
			class: "foam.core.Double",
			name: "TotalSettlementAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "payee",
			of: "net.nanopay.fx.ascendantfx.model.Payee"
		}
	]
});