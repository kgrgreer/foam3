// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "OriginalGroupHeader3",
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
			class: "FObjectArray",
			name: "ReversalReasonInformation",
			shortName: "RvslRsnInf",
			documentation: "Provides detailed information on the reversal reason.",
			of: "net.nanopay.iso20022.PaymentReversalReason7",
			required: false
		}
	]
});