// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "OriginalGroupInformation3",
	documentation: "Unique and unambiguous identifier of the group of transactions as assigned by the original instructing party.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalMessageIdentification",
			shortName: "OrgnlMsgId",
			documentation: "Point to point reference assigned by the original instructing party to unambiguously identify the original group of individual transactions.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "OriginalMessageNameIdentification",
			shortName: "OrgnlMsgNmId",
			documentation: "Specifies the original message name identifier to which the message refers, eg, pacs.003.001.01 or MT103.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "OriginalCreationDateTime",
			shortName: "OrgnlCreDtTm",
			documentation: "Original date and time at which the message was created.",
			required: false
		}
	]
});