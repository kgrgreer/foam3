// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "ExchangeRateInformation1",
	documentation: "Further detailed information on the exchange rate that has been used in the payment transaction.",
	properties: [
		{
			class: "net.nanopay.iso20022.BaseOneRate",
			name: "ExchangeRate",
			shortName: "XchgRate",
			documentation: "The factor used for conversion of an amount from one currency to another. This reflects the price at which one currency was bought with another currency.",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "RateType",
			shortName: "RateTp",
			documentation: "Specifies the type used to complete the currency exchange.",
			of: "net.nanopay.iso20022.ExchangeRateType1Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "ContractIdentification",
			shortName: "CtrctId",
			documentation: "Unique and unambiguous reference to the foreign exchange contract agreed between the initiating party/creditor and the debtor agent.",
			required: false
		}
	]
});