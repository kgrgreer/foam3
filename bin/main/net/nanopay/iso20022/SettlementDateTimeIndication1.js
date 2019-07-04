// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "SettlementDateTimeIndication1",
	documentation: "Information on the occurred settlement time(s) of the payment transaction.",
	properties: [
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "DebitDateTime",
			shortName: "DbtDtTm",
			documentation: "Date and time at which a payment has been debited at the transaction administrator. In the case of TARGET, the date and time at which the payment has been debited at the central bank, expressed in Central European Time (CET).",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "CreditDateTime",
			shortName: "CdtDtTm",
			documentation: "Date and time at which a payment has been credited at the transaction administrator. In the case of TARGET, the date and time at which the payment has been credited at the receiving central bank, expressed in Central European Time (CET).",
			required: false
		}
	]
});