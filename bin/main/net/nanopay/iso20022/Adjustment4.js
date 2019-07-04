// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Adjustment4",
	documentation: "Modification on the value of goods and / or services. For example: rebate, discount, surcharge.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Direction",
			shortName: "Drctn",
			documentation: "Specifies whether the adjustment must be subtracted or added to the total amount.",
			of: "net.nanopay.iso20022.AdjustmentDirection1Code",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Amount",
			shortName: "Amt",
			documentation: "Specifies the monetary amount of the adjustment.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		}
	]
});