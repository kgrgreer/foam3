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
      name: 'amountDue',
      value: '1000 CAD'
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
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.addClass(this.myClass())
        .start('p')
          .add(this.INSTRUCTIVE_TEXT)
        .end()
        .add(this.ACCOUNT)
        .start('p')
          .add(this.FEE_DISCLAIMER)
        .end()
        .start()
          .addClass(this.myClass('separate'))
          .start('span').add(this.AMOUNT_DUE_TEXT).end()
          .start('span').add(this.amountDue).end()
        .end()
        .start()
          .addClass(this.myClass('separate'))
          .start('span').add(this.EXCHANGE_RATE_TEXT).end()
          .start('span').add(this.amountDue).end()
        .end()
        .start()
          .addClass(this.myClass('separate'))
          .start('span').add(this.CONVERTED_AMOUNT_TEXT).end()
          .start('span').add(this.amountDue).end()
        .end()
        .start()
          .addClass(this.myClass('separate'))
          .start('span').add(this.TRANSACTION_FEE_TEXT).end()
          .start('span').add(this.amountDue).end()
        .end()
        .start('p')
          .addClass(this.myClass('separate'))
          .start('span').add(this.AMOUNT_PAID_TEXT).end()
          .start('span').add(this.amountDue).end()
        .end()
        .tag('hr')
        .start('p').add(this.CROSS_BORDER_PAYMENT).end();
    }
  ]
});
