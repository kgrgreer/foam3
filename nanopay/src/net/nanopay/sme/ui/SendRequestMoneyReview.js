foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyReview',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: `The third step of the send/request payment flow. At this step,
                  it will send the request to create new invoice the 
                  associate transactions`,

  imports: [
    'invoice'
  ],

  css: `
    ^ {
      width: 504px;
      margin-bottom: 100px;
    }
    ^ .invoice-details {
      margin-top: 25px;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      // Update the next label
      this.nextLabel = 'Submit';

      this.start().addClass(this.myClass())
        .start().addClass('label-value-row')
          .start().addClass('inline').addClass('body-copy')
            .add(this.AMOUNT_DUE_LABEL)
          .end()
          .start().addClass('float-right').addClass('body-copy')
            .add(this.formattedAmount$)
            .add(` ${this.invoice.destinationCurrency}`)
          .end()
        .end()
        .start()
          .start({
            class: 'net.nanopay.invoice.ui.InvoiceRateView',
            isPayable: this.type,
            isReadOnly: true
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
