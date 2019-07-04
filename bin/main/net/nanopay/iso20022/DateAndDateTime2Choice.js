// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "DateAndDateTime2Choice",
	documentation: "Choice between a date or a date and time format.",
	properties: [
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "Dt",
			shortName: "Dt",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		},
		{
			class: "net.nanopay.iso20022.ISODateTime",
			name: "DtTm",
			shortName: "DtTm",
			preSet: function (_, value) { this.instance_ = {}; return value; }
		}
	]
});