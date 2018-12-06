foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The third step of the send/request payment flow. At this step,
                  it will send the request to create new invoice the 
                  associate transactions`,

  imports: [
    'invoice',
    'loadingSpin'
  ],

  css: `
    ^ {
      width: 504px;
    }
    ^ .invoice-details {
      margin-top: 25px;
    }
    ^ .loading-spin-container {
      width: 200px;
      margin: auto;
    }
    ^ .net-nanopay-ui-LoadingSpinner {
      width: 100px;
      margin: auto;
    }
    ^ .net-nanopay-ui-LoadingSpinner img {
      width: 60px;
      margin-bottom: 20px;
    }
  `,

  messages: [
    { name: 'FETCHING_RATES', message: 'Processing transaction...' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      // Update the next label
      this.nextLabel = 'Submit';

      this.start().addClass(this.myClass())
        .start().hide(this.loadingSpin.isHidden$).addClass('loading-spin-container')
          .start().add(this.loadingSpin).end()
          .start().add(this.FETCHING_RATES).end()
        .end()
        .start().show(this.loadingSpin.isHidden$)
          .start({
            class: 'net.nanopay.invoice.ui.InvoiceRateView',
            isPayable: this.type,
            isReadOnly: true,
            showRates: false
          })
          .end()
          .start({
            class: 'net.nanopay.sme.ui.InvoiceDetails',
            invoice: this.invoice
          }).addClass('invoice-details')
          .end()
        .end()
      .end();
    }
  ]
});
