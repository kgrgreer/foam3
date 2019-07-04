// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "OriginalGroupHeader13",
	documentation: "Provides details on the original group, to which the message refers.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalMessageIdentification",
			shortName: "OrgnlMsgId",
			documentation: "Point to point reference, as assigned by the original instructing party, to unambiguously identify the original message.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalMessageNameIdentification",
			shortName: "OrgnlMsgNmId",
			documentation: "Specifies the original message name identifier to which the message refers.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "OriginalCreationDateTime",
			shortName: "OrgnlCreDtTm",
			documentation: "Date and time at which the original message was created.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max15NumericText",
			name: "OriginalNumberOfTransactions",
			shortName: "OrgnlNbOfTxs",
			documentation: "Number of individual transactions contained in the original message.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.DecimalNumber",
			name: "OriginalControlSum",
			shortName: "OrgnlCtrlSum",
			documentation: "Total of all individual amounts included in the original message, irrespective of currencies.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ExternalPaymentGroupStatus1Code",
			name: "GroupStatus",
			shortName: "GrpSts",
			documentation: "Specifies the status of a group of transactions.",
			required: false
		},
		{
			class: "FObjectArray",
			name: "StatusReasonInformation",
			shortName: "StsRsnInf",
			documentation: "Provides detailed information on the status reason.",
			of: "net.nanopay.iso20022.StatusReasonInformation11",
			required: false
		},
		{
			class: "FObjectArray",
			name: "NumberOfTransactionsPerStatus",
			shortName: "NbOfTxsPerSts",
			documentation: "Detailed information on the number of transactions for each identical transaction status.",
			of: "net.nanopay.iso20022.NumberOfTransactionsPerStatus5",
			required: false
		}
	]
});