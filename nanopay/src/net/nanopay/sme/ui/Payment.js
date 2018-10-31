foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'Payment',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'The second step in the send/request money flow for Ablii',

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
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice'
    }
  ],

  messages: [
    {
      name: 'INSTRUCTIVE_TEXT',
      message: 'Withdraw from'
    },
    {
      name: 'FEE_DISCLAIMER',
      message: 'Currency conversion fees will be applied.'
    },
    {
      name: 'AMOUNT_DUE_TEXT',
      message: 'Amount Due'
    },
    {
      name: 'EXCHANGE_RATE_TEXT',
      message: 'Exchange Rate'
    },
    {
      name: 'CONVERTED_AMOUNT_TEXT',
      message: 'Converted Amount'
    },
    {
      name: 'TRANSACTION_FEE_TEXT',
      message: 'Transaction Fee'
    },
    {
      name: 'AMOUNT_PAID_TEXT',
      message: 'Amount Paid'
    },
    {
      name: 'CROSS_BORDER_PAYMENT',
      message: 'Cross-border Payment'
    },
    {
      name: 'PAYMENT_SUBTITLE',
      message: 'Payment details'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      // Hide save button
      this.hasSaveOption = false;
      // Show back button
      this.hasBackOption = true;
      this.nextLabel = 'Next';

      this.addClass(this.myClass())
      .start({
          class: 'net.nanopay.invoice.ui.InvoiceRateView',
          invoice: this.invoice,
      })
      .end();
    }
  ]
});
