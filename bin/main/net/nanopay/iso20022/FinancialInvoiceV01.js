// WARNING: GENERATED CODE, DO NOT MODIFY BY HAND!
foam.CLASS({
	package: "net.nanopay.iso20022",
	name: "FinancialInvoiceV01",
	documentation: `Scope
The FinancialInvoice message is used to support the provision of financial and related services where there is a requirement to exchange invoice information.
Usage
While the prime function of the FinancialInvoice message is as a request from the seller to the buyer for payment, the FinancialInvoice message can also serve to evidence an invoice in support of a financial service such as invoice factoring, letters of credit, and bank payment obligations, to enable Web based services such as electronic bill payment and presentment, and as the basis to transfer invoice information via third parties such as e-invoicing service providers.
A consequence of the receipt of an invoice by the buyer is that it acts as a trigger for the use of related messages that are already defined in ISO 20022, notably where the information contained in the Financial Invoice enables payment for the goods or services received, and/or is provided in support of a request for invoice financing. While certain of these related messages, such as the CreditTransfer and PaymentInitiation messages, are shown in the sequence diagram they are out of scope. They are shown only to illustrate a given scenario and to place the invoice in the context of the financial banking processes that might be conducted between different financial institutions.
The use of self-billing by the buyer to the seller, where the buyer acts as the invoice issuer or the process of handling an incorrect invoice, is not in scope.`,
	properties: [
		{
			class: "FObjectProperty",
			name: "InvoiceHeader",
			shortName: "InvcHdr",
			documentation: "Collection of data that is exchanged between two or more parties in written, printed or electronic form. It contains general data relevant to the main body of the invoice such as date of issue, currency code and identification number.",
			of: "net.nanopay.iso20022.InvoiceHeader1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TradeAgreement",
			shortName: "TradAgrmt",
			documentation: "Commercial information such as terms of commerce, parties, and documentation, related to the trading agreement under which this invoice is issued.",
			of: "net.nanopay.iso20022.TradeAgreement6",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TradeDelivery",
			shortName: "TradDlvry",
			documentation: "Supply chain shipping arrangements for delivery of invoiced products and/or services.",
			of: "net.nanopay.iso20022.TradeDelivery1",
			required: false
		},
		{
			class: "FObjectProperty",
			name: "TradeSettlement",
			shortName: "TradSttlm",
			documentation: `Settlement information that enables the financial reconciliation and payment of this invoice.
`,
			of: "net.nanopay.iso20022.TradeSettlement1",
			required: false
		},
		{
			class: "FObjectArray",
			name: "LineItem",
			shortName: "LineItm",
			documentation: `Unit of information in this invoice showning the related provision of products and/or services and monetary summations reported as a discrete line item.


`,
			of: "net.nanopay.iso20022.LineItem10",
			required: false
		}
	]
});