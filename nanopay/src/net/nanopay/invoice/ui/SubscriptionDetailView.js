foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'SubscriptionDetailView',
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
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start()
        .tag({ class: 'net.nanopay.invoice.ui.shared.SingleSubscriptionView', data: this.data })
        .end()
    }
  ]
});