// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "SettlementTimeRequest2",
	documentation: "Provides information on the requested settlement time(s) of the payment instruction.",
	properties: [
		{
			class: "net.nanopay.iso20022.ISOTime",
			name: "CLSTime",
			shortName: "CLSTm",
			documentation: `Time by which the amount of money must be credited, with confirmation, to the CLS Bank's account at the central bank.
Usage: Time must be expressed in Central European Time (CET).`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISOTime",
			name: "TillTime",
			shortName: "TillTm",
			documentation: "Time until when the payment may be settled.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISOTime",
			name: "FromTime",
			shortName: "FrTm",
			documentation: "Time as from when the payment may be settled.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISOTime",
			name: "RejectTime",
			shortName: "RjctTm",
			documentation: "Time by when the payment must be settled to avoid rejection.",
			required: false
		}
	]
});