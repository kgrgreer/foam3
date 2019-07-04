// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentTypeInformation25",
	documentation: "Set of elements used to provide further details of the type of payment.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "InstructionPriority",
			shortName: "InstrPrty",
			documentation: "Indicator of the urgency or order of importance that the instructing party would like the instructed party to apply to the processing of the instruction.",
			of: "net.nanopay.iso20022.Priority2Code",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "ClearingChannel",
			shortName: "ClrChanl",
			documentation: "Specifies the clearing channel to be used to process the payment instruction.",
			of: "net.nanopay.iso20022.ClearingChannel2Code",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ServiceLevel",
			shortName: "SvcLvl",
			documentation: "Agreement under which or rules under which the transaction should be processed.",
			of: "net.nanopay.iso20022.ServiceLevel8Choice",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "LocalInstrument",
			shortName: "LclInstrm",
			documentation: `User community specific instrument.

Usage: This element is used to specify a local instrument, local clearing option and/or further qualify the service or service level.`,
			of: "net.nanopay.iso20022.LocalInstrument2Choice",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "SequenceType",
			shortName: "SeqTp",
			documentation: "Identifies the direct debit sequence, such as first, recurrent, final or one-off.",
			of: "net.nanopay.iso20022.SequenceType3Code",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "CategoryPurpose",
			shortName: "CtgyPurp",
			documentation: `Specifies the high level purpose of the instruction based on a set of pre-defined categories.
Usage: This is used by the initiating party to provide information concerning the processing of the payment. It is likely to trigger special processing by any of the agents involved in the payment chain.`,
			of: "net.nanopay.iso20022.CategoryPurpose1Choice",
			required: false
		}
	]
});