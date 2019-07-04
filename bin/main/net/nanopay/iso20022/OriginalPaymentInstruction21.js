// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "OriginalPaymentInstruction21",
	documentation: "Provides details on the original transactions, to which the status report message refers.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "ReversalPaymentInformationIdentification",
			shortName: "RvslPmtInfId",
			documentation: `Unique identification, as assigned by an instructing party for an instructed party, to unambiguously identify the reversed payment information group.
Usage: The instructing party is the party sending the reversal message and not the party that sent the original instruction that is being reversed.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalPaymentInformationIdentification",
			shortName: "OrgnlPmtInfId",
			documentation: "Unique identification, as assigned by the original sending party, to unambiguously identify the original payment information group.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max15NumericText",
			name: "OriginalNumberOfTransactions",
			shortName: "OrgnlNbOfTxs",
			documentation: "Number of individual transactions contained in the original payment information group.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.DecimalNumber",
			name: "OriginalControlSum",
			shortName: "OrgnlCtrlSum",
			documentation: "Total of all individual amounts included in the original payment information group, irrespective of currencies.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.BatchBookingIndicator",
			name: "BatchBooking",
			shortName: "BtchBookg",
			documentation: `Identifies whether a single entry per individual transaction or a batch entry for the sum of the amounts of all transactions within the group of a message is requested.
Usage: Batch booking is used to request and not order a possible batch booking.`,
			required: false
		},
		{
			class: "net.nanopay.iso20022.TrueFalseIndicator",
			name: "PaymentInformationReversal",
			shortName: "PmtInfRvsl",
			documentation: "Indicates whether or not the reversal applies to the complete original payment information group or to individual transactions within that group.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "ReversalReasonInformation",
			shortName: "RvslRsnInf",
			documentation: "Provides detailed information on the reversal reason.",
			of: "net.nanopay.iso20022.PaymentReversalReason7",
			required: false
		},
		{
			class: "FObjectArray",
			name: "TransactionInformation",
			shortName: "TxInf",
			documentation: "Provides information on the original transactions to which the reversal message refers.",
			of: "net.nanopay.iso20022.PaymentTransaction77",
			required: false
		}
	]
});