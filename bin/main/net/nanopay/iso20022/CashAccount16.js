// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "CashAccount16",
	documentation: "Set of elements used to identify an account.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Identification",
			shortName: "Id",
			documentation: "Unique and unambiguous identification for the account between the account owner and the account servicer.",
			of: "net.nanopay.iso20022.AccountIdentification4Choice",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the nature, or use of the account.",
			of: "net.nanopay.iso20022.CashAccountType2",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ActiveOrHistoricCurrencyCode",
			name: "Currency",
			shortName: "Ccy",
			documentation: `Identification of the currency in which the account is held. 

Usage: Currency should only be used in case one and the same account number covers several currencies
and the initiating party needs to identify which currency needs to be used for settlement on the account.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max70Text",
			name: "Name",
			shortName: "Nm",
			documentation: `Name of the account, as assigned by the account servicing institution, in agreement with the account owner in order to provide an additional means of identification of the account.

Usage: The account name is different from the account owner name. The account name is used in certain user communities to provide a means of identifying the account, in addition to the account owner's identity and the account number.`,
			required: false
		}
	]
});