foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionView',
  extends: 'foam.u2.View',

  documentation: 'Summary View of Recurring Invoices.',

  requires: [ 
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice'
  ]

});