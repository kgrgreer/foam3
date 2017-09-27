foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionEditView',
  extends: 'foam.u2.View',

  documentation: "Edit View for Recurring Invoices.",

  requires: [ 
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice'
  ],

  imports: [
    'recurringInvoiceDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 970px;
          margin: auto;
        }
        */
      }
    })
  ],

  methods: [
    function initE(){

    }
  ]
});