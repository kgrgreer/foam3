foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoneyPayment',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'The second step in the send/request payment flow for Ablii',

  imports: [
    'invoice',
    'user'
  ],

  css: `
    ^ {
      width: 504px;
    }

    ^separate {
      display: flex;
      justify-content: space-between;
    }
  `,

  properties: [
    'type'
  ],

  methods: [
    function initE() {
      this.SUPER();
      // Show back button
      this.hasBackOption = true;
      // Update the next button label
      this.nextLabel = 'Review';
      this.addClass(this.myClass())
      .start({
          class: 'net.nanopay.invoice.ui.InvoiceRateView',
      })
      .end();
    }
  ]
});
