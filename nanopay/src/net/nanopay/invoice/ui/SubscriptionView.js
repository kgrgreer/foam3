foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionView',
  extends: 'foam.u2.View',

  documentation: "Summary View of User' Recurring Invoices.",

  requires: [ 
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.RecurringInvoice'
  ],

  imports: [
    'recurringInvoiceDAO'
  ],

  methods: [
    function initE(){
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start().add('Subscriptions').end()
        .tag({ class: 'foam.u2.view.TableView', of: this.RecurringInvoice, data: this.recurringInvoiceDAO})
    }
  ]
});