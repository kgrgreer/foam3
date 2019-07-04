// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "BinaryFile1",
	documentation: "Computer file stored in a binary format.",
	properties: [
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "MIMEType",
			shortName: "MIMETp",
			documentation: "Code specifying the Multipurpose Internet Mail Extensions (MIME) type for this attached binary file. Reference IANA (Internet Assigned Numbers Authority) - MIME Media Types (www.iana.org/assignments/media-types).",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "EncodingType",
			shortName: "NcodgTp",
			documentation: "Specifies the encoding algorithm used for this attached binary file. Reference IANA (Internet Assigned Numbers Authority) - Transfer Encodings (www.iana.org/assignments/transfer-encodings).",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max35Text",
			name: "CharacterSet",
			shortName: "CharSet",
			documentation: "Specifies a code signifying the particular character set used for this attached binary file. Reference IANA (Internet Assigned Numbers Authority) - Character Sets (www.iana.org/assignments/character-sets).",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max100KBinary",
			name: "IncludedBinaryObject",
			shortName: "InclBinryObjct",
			documentation: "Binary object included in this attached binary file.",
			required: false
		}
	]
});