foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The third step of the send/request money flow. At this step,
                  it will send the request to create new invoice the 
                  associate transactions`,

  imports: [
    'invoice'
  ],

  css: `
    ^ .block {
      margin-top: 25px;
      width: 500px;
      margin-bottom: 120px;
    }
    ^ .invoice-details {
      background-color: white;
      padding: 15px;
      border-radius: 4px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      // Update the next label
      this.nextLabel = 'Submit';
      this.addClass(this.myClass())
        .start({
          class: 'net.nanopay.invoice.ui.InvoiceRateView',
          invoice: this.invoice,
          isPayable: this.type,
          isReadOnly: true
        })
        .end()
        .start({
          class: 'net.nanopay.sme.ui.InvoiceDetails',
          invoice$: this.invoice$
        }).addClass('block').addClass('invoice-details')
        .end();
    }
  ]
});
