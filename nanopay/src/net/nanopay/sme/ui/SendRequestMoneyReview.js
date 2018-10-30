foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The third step of the send/request money flow. At this step,
                  it will send the request to create new invoice the 
                  associate transactions`,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.nextLabel = 'Submit';
      this.addClass(this.myClass())
        .start({
          class: 'net.nanopay.sme.ui.InvoiceDetails',
          invoice$: this.invoice$
        })
        .end();
    }
  ]
});
