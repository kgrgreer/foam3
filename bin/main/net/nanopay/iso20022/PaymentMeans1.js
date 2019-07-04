// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "PaymentMeans1",
	documentation: "Means by which a payment will be or has been made for settlement purposes.",
	properties: [
		{
			class: "FObjectProperty",
			name: "PaymentType",
			shortName: "PmtTp",
			documentation: "Type, or nature, of the payment, eg, express payment.",
			of: "net.nanopay.iso20022.PaymentTypeInformation19",
			required: false
		},
		{
			class: "foam.core.Enum",
			name: "PaymentMethodCode",
			shortName: "PmtMtdCd",
			documentation: "Transfer method to be used for the transfer.",
			of: "net.nanopay.iso20022.PaymentMethod4Code",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PayeeCreditorAccount",
			shortName: "PyeeCdtrAcct",
			documentation: "Creditor financial account of the payee party for this payment means.",
			of: "net.nanopay.iso20022.CashAccount16",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PayeeFinancialInstitution",
			shortName: "PyeeFI",
			documentation: "Creditor financial institution of the payee party specified for this payment means.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PayerDebtorAccount",
			shortName: "PyerDbtrAcct",
			documentation: "Debtor financial account of the payer party for this payment means.",
			of: "net.nanopay.iso20022.CashAccount16",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PayerFinancialInstitution",
			shortName: "PyerFI",
			documentation: "Debtor financial institution of the payer party specified for this payment means.",
			of: "net.nanopay.iso20022.BranchAndFinancialInstitutionIdentification4",
			required: false
		}
	]
});