// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "SettlementAllowanceCharge1",
	documentation: "Specifies a pricing component, such as a service, promotion, allowance or charge, for this trade settlement.",
	properties: [
		{
			class: "net.nanopay.iso20022.YesNoIndicator",
			name: "AllowanceChargeIndicator",
			shortName: "AllwncChrgInd",
			documentation: "Indication of whether or not this allowance charge is a charge.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ActualAmount",
			shortName: "ActlAmt",
			documentation: "Actual monetary amount specified for the allowance or charge.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Reason",
			shortName: "Rsn",
			documentation: "Reason, expressed as text, for this allowance or charge.",
			of: "net.nanopay.iso20022.DiscountOrChargeType1Choice",
			required: false
		}
	]
});