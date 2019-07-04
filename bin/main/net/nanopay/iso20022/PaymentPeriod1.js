// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentPeriod1",
	documentation: "Specifies the payment terms by means of a code and a period.",
	properties: [
		{
			class: "foam.core.Enum",
			name: "Code",
			shortName: "Cd",
			documentation: "Code for the payment.",
			of: "net.nanopay.iso20022.PaymentTime1Code",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Number",
			name: "NumberOfDays",
			shortName: "NbOfDays",
			documentation: "Number of days after which the payment must be effected.",
			required: false
		}
	]
});