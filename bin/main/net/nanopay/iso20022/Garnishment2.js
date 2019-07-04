// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "Garnishment2",
	documentation: "Provides remittance information about a payment for garnishment-related purposes.",
	properties: [
		{
			class: "FObjectProperty",
			name: "Type",
			shortName: "Tp",
			documentation: "Specifies the type of garnishment.",
			of: "net.nanopay.iso20022.GarnishmentType1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Garnishee",
			shortName: "Grnshee",
			documentation: "Ultimate party that owes an amount of money to the (ultimate) creditor, in this case, to the garnisher.",
			of: "net.nanopay.iso20022.PartyIdentification125",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "GarnishmentAdministrator",
			shortName: "GrnshmtAdmstr",
			documentation: "Party on the credit side of the transaction who administers the garnishment on behalf of the ultimate beneficiary.",
			of: "net.nanopay.iso20022.PartyIdentification125",
			required: false
		},
		{
			class: "net.nanopay.iso20022.Max140Text",
			name: "ReferenceNumber",
			shortName: "RefNb",
			documentation: "Reference information that is specific to the agency receiving the garnishment.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.ISODate",
			name: "Date",
			shortName: "Dt",
			documentation: "Date of payment which garnishment was taken from.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "RemittedAmount",
			shortName: "RmtdAmt",
			documentation: "Amount of money remitted for the referred document.",
			of: "net.nanopay.iso20022.ActiveOrHistoricCurrencyAndAmount",
			required: false
		},
		{
			class: "net.nanopay.iso20022.TrueFalseIndicator",
			name: "FamilyMedicalInsuranceIndicator",
			shortName: "FmlyMdclInsrncInd",
			documentation: "Indicates if the person to whom the garnishment applies (that is, the ultimate debtor) has family medical insurance coverage available.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.TrueFalseIndicator",
			name: "EmployeeTerminationIndicator",
			shortName: "MplyeeTermntnInd",
			documentation: "Indicates if the employment of the person to whom the garnishment applies (that is, the ultimate debtor) has been terminated.",
			required: false
		}
	]
});