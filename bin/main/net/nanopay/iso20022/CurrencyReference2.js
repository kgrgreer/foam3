// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CurrencyReference2",
	documentation: "Specifies the process of a currency exchange or conversion.",
	properties: [
		{
			class: "net.nanopay.iso20022.CurrencyCode",
			name: "TargetCurrency",
			shortName: "TrgtCcy",
			documentation: "Currency into which an amount is to be converted in a currency conversion.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.CurrencyCode",
			name: "SourceCurrency",
			shortName: "SrcCcy",
			documentation: "Currency of the amount to be converted in a currency conversion.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ExchangeRateInformation",
			shortName: "XchgRateInf",
			documentation: "The value of one currency expressed in relation to another currency. ExchangeRate expresses the ratio between UnitCurrency and QuotedCurrency (ExchangeRate = UnitCurrency/QuotedCurrency).",
			of: "net.nanopay.iso20022.ExchangeRateInformation1",
			required: false
		}
	]
});