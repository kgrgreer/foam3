// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "NumberOfTransactionsPerStatus5",
	documentation: "Set of elements used to provide detailed information on the number of transactions that are reported with a specific transaction status.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max15NumericText",
			name: "DetailedNumberOfTransactions",
			shortName: "DtldNbOfTxs",
			documentation: "Number of individual transactions contained in the message, detailed per status.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ExternalPaymentTransactionStatus1Code",
			name: "DetailedStatus",
			shortName: "DtldSts",
			documentation: "Common transaction status for all individual transactions reported.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.DecimalNumber",
			name: "DetailedControlSum",
			shortName: "DtldCtrlSum",
			documentation: "Total of all individual amounts included in the message, irrespective of currencies, detailed per status.",
			required: false
		}
	]
});