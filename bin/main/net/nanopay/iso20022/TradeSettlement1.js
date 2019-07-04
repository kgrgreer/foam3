// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "TradeSettlement1",
	documentation: "Trade settlement details for this invoice which involves the payment of an outstanding debt, account, or charge.",
	properties: [
		{
			class: "FObjectArray",
			name: "DuePayableAmount",
			shortName: "DuePyblAmt",
			documentation: "Monetary value that is an exact amount due and payable, such as the amount due to the creditor.",
			of: "net.nanopay.iso20022.CurrencyAndAmount",
			required: false
		},
		{
			class: "FObjectArray",
			name: "CreditorReference",
			shortName: "CdtrRef",
			documentation: "Unique and unambiguous reference assigned by the creditor.",
			of: "net.nanopay.iso20022.CreditorReferenceInformation2",
			required: false
		},
		{
			class: "StringArray",
			name: "PaymentReference",
			shortName: "PmtRef",
			documentation: "Unique and unambiguous identifier for a payment transaction, as assigned by the originator. The payment transaction reference is used for reconciliation or to link tasks relating to the payment transaction.",
			required: false
		},
		{
			class: "net.nanopay.iso20022.CurrencyCode",
			name: "InvoiceCurrencyCode",
			shortName: "InvcCcyCd",
			documentation: "Code specifying the currency of the invoice.",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Invoicer",
			shortName: "Invcr",
			documentation: "Organization issuing the invoice.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Invoicee",
			shortName: "Invcee",
			documentation: "Party to whom the invoice was issued.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Payee",
			shortName: "Pyee",
			documentation: "Party specified to receive payment for the invoice.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "Payer",
			shortName: "Pyer",
			documentation: "Party specified to initiate payment for the invoice.",
			of: "net.nanopay.iso20022.TradeParty1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TaxCurrencyExchange",
			shortName: "TaxCcyXchg",
			documentation: "Currency exchange applicable to a tax.",
			of: "net.nanopay.iso20022.CurrencyReference2",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InvoiceCurrencyExchange",
			shortName: "InvcCcyXchg",
			documentation: "Currency exchange applicable to the invoice.",
			of: "net.nanopay.iso20022.CurrencyReference2",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "PaymentCurrencyExchange",
			shortName: "PmtCcyXchg",
			documentation: "Currency exchange applicable to the payment.",
			of: "net.nanopay.iso20022.CurrencyReference2",
			required: false
		},
		{
			class: "FObjectArray",
			name: "PaymentMeans",
			shortName: "PmtMeans",
			documentation: "Means of payment (for example, credit transfer, cheque, money order, or credit card) specified to initiate payment of the invoice.",
			of: "net.nanopay.iso20022.PaymentMeans1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "Tax",
			shortName: "Tax",
			documentation: "Amount of money due to the government or tax authority, according to various pre-defined parameters such as thresholds or income.",
			of: "net.nanopay.iso20022.SettlementTax1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "BillingPeriod",
			shortName: "BllgPrd",
			documentation: "Specifies the applicable billing period.",
			of: "net.nanopay.iso20022.Period1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AllowanceCharge",
			shortName: "AllwncChrg",
			documentation: "Allowance or charge specified.",
			of: "net.nanopay.iso20022.SettlementAllowanceCharge1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "SubTotalCalculatedTax",
			shortName: "SubTtlClctdTax",
			documentation: "Tax subtotal calculated.",
			of: "net.nanopay.iso20022.SettlementSubTotalCalculatedTax1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "LogisticsCharge",
			shortName: "LogstcsChrg",
			documentation: "Logistics service charge specified.",
			of: "net.nanopay.iso20022.ChargesDetails2",
			required: false
		},
		{
			class: "FObjectArray",
			name: "PaymentTerms",
			shortName: "PmtTerms",
			documentation: "Payment terms.",
			of: "net.nanopay.iso20022.PaymentTerms3",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "MonetarySummation",
			shortName: "MntrySummtn",
			documentation: "Monetary totals specified for the invoice.",
			of: "net.nanopay.iso20022.SettlementMonetarySummation1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "AdjustmentAmountAndReason",
			shortName: "AdjstmntAmtAndRsn",
			documentation: "Financial adjustment specified.",
			of: "net.nanopay.iso20022.DocumentAdjustment2",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "InvoiceReferencedDocument",
			shortName: "InvcRefdDoc",
			documentation: "Invoice document referenced.",
			of: "net.nanopay.iso20022.DocumentIdentification22",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "ProformaInvoiceReferencedDocument",
			shortName: "ProfrmInvcRefdDoc",
			documentation: "Pro-forma invoice document referenced.",
			of: "net.nanopay.iso20022.DocumentIdentification22",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "LetterOfCreditReferencedDocument",
			shortName: "LttrOfCdtRefdDoc",
			documentation: "Letter of credit document referenced.",
			of: "net.nanopay.iso20022.DocumentIdentification7",
			required: false
		},
		{
			class: "FObjectArray",
			name: "FinancialCard",
			shortName: "FinCard",
			documentation: "Financial card specified. The card is used to represent a financial account for the purpose of payment settlement.",
			of: "net.nanopay.iso20022.FinancialCard1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "PurchaseAccountingAccount",
			shortName: "PurchsAcctgAcct",
			documentation: "Specific purchase account for recording debits and credits for accounting purposes.",
			of: "net.nanopay.iso20022.AccountingAccount1",
			required: false
		},
		{
			class: "StringArray",
			name: "IssuerFactoringListIdentification",
			shortName: "IssrFactrgListId",
			documentation: "Factoring list document referenced.",
			required: false
		},
		{
			class: "StringArray",
			name: "IssuerFactoringAgreementIdentification",
			shortName: "IssrFactrgAgrmtId",
			documentation: "Factoring agreement document referenced.",
			required: false
		}
	]
});