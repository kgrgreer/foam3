// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CurrencyAndAmount",
	documentation: `Number of monetary units specified in a currency, where the unit of currency is explicit and compliant with ISO 4217. The decimal separator is a dot.
Note: A zero amount is considered a positive amount.`,
	properties: [
		{
			class: "net.nanopay.iso20022.CurrencyCode",
			name: "Ccy",
			shortName: "Ccy",
			xmlAttribute: true
		},
		{
			class: "net.nanopay.iso20022.CurrencyAndAmount_SimpleType",
			name: "text",
			xmlTextNode: true
		}
	]
});