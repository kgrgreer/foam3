foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'Payment',
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
    ^ .net-nanopay-sme-ui-InfoMessageContainer {
      font-size: 14px;
      line-height: 1.5;
      margin-top: 35px;
    }
  `,

  properties: [
    'type',
    {
      name: 'isEmployee',
      expression: function(user) {
        return user.group.includes('.employee');
      }
    }
  ],

  messages: [
    {
      name: 'NOTICE_TITLE',
      message: 'NOTICE: EXCHANGE RATE SUBJECT TO CHANGE.'
    },
    {
      name: 'NOTICE_WARNING',
      message: 'The final exchange rate and resulting amount to be paid will be displayed to the approver.'
    }
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
      })
      .end()
      .start().show(this.isEmployee$)
        .tag({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.NOTICE_WARNING, title: this.NOTICE_TITLE })
      .end();
    }
  ]
});
