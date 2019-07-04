// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Charges2",
	documentation: "Set of elements used to provide information on the charges related to the payment transaction.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Amount",
			shortName: "Amt",
			documentation: "Transaction charges to be paid by the charge bearer.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Agent",
			shortName: "Agt",
			documentation: "Agent that takes the transaction charges or to which the transaction charges are due.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification5",
			required: false
		}
	]
});