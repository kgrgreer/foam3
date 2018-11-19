foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'Payment',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'The second step in the send/request money flow for Ablii',

  imports: [
    'invoice'
  ],

  css: `
    ^ {
      width: 488px;
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
      // Hide save button
      this.hasSaveOption = false;
      // Show back button
      this.hasBackOption = true;
      // Update the next button label
      this.nextLabel = 'Review';

      this.addClass(this.myClass())
      .start({
          class: 'net.nanopay.invoice.ui.InvoiceRateView',
          invoice: this.invoice
      })
      .end();
    }
  ]
});
