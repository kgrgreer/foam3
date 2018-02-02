foam.CLASS({
	package:  'net.nanopay.fresh',
	name:  'FreshInvoice',
	properties:  [
		{
			class:  'Int',
			name:  'status'
		},
		{
			class:  'Date',
			name:  'create_date'
		},
		{
      class:  'FObjectProperty',
      of: 'net.nanopay.fresh.model.FreshInvoiceAmount',
			name:  'outstanding'
		},
		{
			class:  'String',
			name:  'payment_status'
		},
		{
			class:  'Date',
			name:  'code'
		},
		{
			class:  'Int',
			name:  'ownerid'
		},
		{
			class:  'String',
			name:  'vat_number'
		},
		{
			class:  'Int',
			name:  'id'
		},
		{
			class:  'Boolean',
			name:  'gmail'
		},
		{
			class:  'String',
			name:  'vat_name'
		},
		{
			class:  'String',
			name:  'v3_status'
		},
		{
			class:  'Int',
			name:  'parent'
		},
		{
			class:  'String',
			name:  'country'
		},
		{
			class:  'String',
			name:  'lname'
		},
		{
			class:  'String',
			name:  'deposit_status'
		},
		{
			class:  'Int',
			name:  'estimateid'
		},
		{
			class:  'Int',
			name:  'ext_archive'
		},
		{
			class:  'String',
			name:  'template'
		},
		{
			class:  'Int',
			name:  'basecampid'
		},
		{
			class:  'Boolean',
			name:  'show_attachments'
		},
		{
			class:  'Int',
			name:  'vis_state'
		},
		{
			class:  'String',
			name:  'current_organization'
		},
		{
			class:  'String',
			name:  'province'
		},
		{
			class:  'Date',
			name:  'due_date'
		},
		{
			class:  'Date',
			name:  'updated'
		},
		{
			class:  'String',
			name:  'terms'
		},
		{
			class:  'String',
			name:  'description'
		},
		{
			class:  'String',
			name:  'street2'
		},
		{
      class:  'FObjectProperty',
      of: 'net.nanopay.fresh.model.FreshInvoiceAmount',
			name:  'paid'
		},
		{
			class:  'Int',
			name:  'invoiceid'
		},
		{
      class:  'FObjectProperty',
      of: 'net.nanopay.fresh.model.FreshInvoiceAmount',
			name:  'discount_total'
		},
		{
			class:  'String',
			name:  'address'
		},
		{
			class:  'String',
			name:  'invoice_number'
		},
		{
			class:  'Int',
			name:  'customerid'
		},
		{
			class:  'Date',
			name:  'discount_value'
		},
		{
			class:  'String',
			name:  'accounting_systemid'
		},
		{
			class:  'String',
			name:  'organization'
		},
		{
			class:  'Int',
			name:  'due_offset_days'
		},
		{
			class:  'String',
			name:  'language'
		},
		{
			class:  'String',
			name:  'display_status'
		},
		{
			class:  'String',
			name:  'notes'
		},
		{
      class:  'FObjectProperty',
      of:'net.nanopay.fresh.model.FreshInvoiceAmount',
			name:  'amount'
		},
		{
			class:  'Date',
			name:  'street'
		},
		{
			class:  'String',
			name:  'city'
		},
		{
			class:  'String',
			name:  'currency_code'
		},
		{
			class:  'Int',
			name:  'sentid'
		},
		{
			class:  'String',
			name:  'fname'
		},
		{
			class:  'Date',
			name:  'created_at'
		},
		{
			class:  'Boolean',
			name:  'auto_bill'
		},
		{
			class:  'String',
			name:  'accountid'
		}
	]
});