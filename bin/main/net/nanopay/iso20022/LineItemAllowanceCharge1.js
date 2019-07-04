// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "LineItemAllowanceCharge1",
	documentation: "Pricing component, such as a service, promotion, allowance or charge, for this line item.",
	properties: [
		{
			class: "net.nanopay.iso20022.YesNoIndicator",
			name: "ChargeIndicator",
			shortName: "ChrgInd",
			documentation: "Indication of whether or not this allowance charge is a charge.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ActualAmount",
			shortName: "ActlAmt",
			documentation: "Actual monetary value of this allowance charge.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "BasisQuantity",
			shortName: "BsisQty",
			documentation: "Quantity on which this allowance charge is based.",
			of: "net.nanopay.iso20022.Quantity3",
			required: false
		},
		{
			class: "net.nanopay.iso20022.PercentageRate",
			name: "CalculationPercent",
			shortName: "ClctnPct",
			documentation: "Percentage applied to calculate this allowance charge.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Number",
			name: "SequenceNumber",
			shortName: "SeqNb",
			documentation: "Specifies the order in which the allowance or charge is applied.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Reason",
			shortName: "Rsn",
			documentation: "Reason, expressed as text, for this allowance charge.",
			of: "net.nanopay.iso20022.DiscountOrChargeType1Choice",
			required: false
		}
	]
});