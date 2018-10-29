foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: '',

  properties: [
    {
      class: 'FObjectProperty',
      name: 'invoice',
      factory: function() {
        return this.Invoice.create({});
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start({
          class: 'net.nanopay.sme.ui.InvoiceDetails',
          invoice: this.invoice
        })
        .end();
    }
  ]
});
