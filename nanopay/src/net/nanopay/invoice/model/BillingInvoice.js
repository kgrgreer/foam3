foam.CLASS({
	package: 'net.nanopay.invoice.model',
	name: 'BillingInvoice',
	extends: 'net.nanopay.invoice.model.Invoice',

	documentation: `BillingInvoice extends the Invoice model 
		and specifies for billing invoices only`,

	properties: [
		{
			class: 'Date',
			name: 'billingStartDate'
		},
		{
			class: 'Date',
			name: 'billingEndDate'
		}
	]
});