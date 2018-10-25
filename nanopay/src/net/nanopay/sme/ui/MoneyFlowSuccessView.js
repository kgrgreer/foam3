foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'MoneyFlowSuccessView',
  extends: 'foam.u2.Controller',

  documentation: `
  TO USE CLASS EXAMPLES:

  1) To get to ReceiveMoney flow success screen
  this.stack.push({
    class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
    invoice: invoice
  });
  
  2) Sending money as an Emplyee without Approver permissions
  this.stack.push({
    class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
    invoice: invoice,
    isSendMoney: true
  });

  3) Sending money as an Approver
  this.stack.push({
    class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
    invoice: invoice,
    isSendMoney: true,
    isApprover: true
  });
  `,

  imports: [
    'stack'
  ],

  css: `
    ^ {
      max-width: 900px;
      margin: auto;
      padding-left: 400px;
    }
    ^ .link {
      color: #7404EA;
      cursor: pointer;
      font-size: 14px;
    }
    ^ .success-title {
      margin-bottom: 30px;
      font-size: 22;
    }
    ^ .success-body {
      font-size: 14px;
    }
    ^ .imgg{
      padding: 5px;
      margin: 100px 0px 15px 155px;
    }
  `,

  properties: [
    {
      name: 'invoice'
    },
    {
      name: 'isSendMoney',
      class: 'Boolean',
    },
    {
      name: 'isApprover',
      class: 'Boolean'
    },
    {
      name: 'topImage',
      value: { class: 'foam.u2.tag.Image', data: 'images/canada.svg' }
    },
    {
      name: 'formattedAmount'
    },
    {
      name: 'invoiceName'
    }
  ],

  messages: [
    { name: 'TITLE_SEND1', message: `Sent ` },
    { name: 'TITLE_SEND2', message: ` to ` },
    { name: 'TITLE_REC1', message: 'Requested ' },
    { name: 'TITLE_REC2', message: ' from ' },
    { name: 'TITLE_APP', message: 'Pending approval for ' },
    { name: 'BODY_SEND', message: 'Invoice status has changed to Paid' },
    { name: 'BODY_REC', message: 'This invoice is pending payment from ' },
    { name: 'BODY_APP', message: 'Invoice status will change to Paid, once an Approver accepts this payment of this invoice to ' },
    { name: 'REF', message: 'Reference ID ' },
    { name: 'V_PAY', message: 'View this payable' },
    { name: 'V_REC', message: 'View this receivable' },
  ],

  methods: [
    function populateVariables() {
      this.invoice.destinationCurrency$find.then((currency) => {
        this.formattedAmount = currency.format(this.invoice.amount) + ' ' +
          currency.alphabeticCode;
      });

      this.invoiceName = this.isSendMoney ?
          (this.invoice.payee.businessName ? this.invoice.payee.businessName : this.invoice.payee.label()) :
          (this.invoice.payer.businessName ? this.invoice.payer.businessName : this.invoice.payer.label());
    },

    function initE() {
      this.populateVariables();
      this.SUPER();
      this.addClass(this.myClass())
        .start(this.topImage).addClass('imgg').end();
      if ( this.isSendMoney ) {
        if ( ! this.isApprover ) {
          // pending approval
          this.start()
            .add(this.TITLE_APP).add(this.formattedAmount$).add(this.TITLE_SEND2).add(this.invoiceName$)
            .addClass('success-title')
          .end()
          .start()
            .add(this.BODY_APP).add(this.invoiceName$, '.')
            .br()
            .add(this.REF).add(this.invoice.referenceId)
            .addClass('success-body')
          .end()
          .start()
          .br()
            .add(this.V_PAY)
            .addClass('link')
            .on('click', () => {
              this.stack.push({ class: 'net.nanopay.invoice.ui.sme.PayablesView' });
            })
          .end();
          return;
        }
        // send money
        this.start()
          .add(this.TITLE_SEND1).add(this.formattedAmount$).add(this.TITLE_SEND2).add(this.invoiceName$)
          .addClass('success-title')
        .end()
        .start()
          .add(this.BODY_SEND)
          .br()
          .add(this.REF).add(this.invoice.referenceId)
          .addClass('success-body')
        .end()
        .start()
        .br()
          .add(this.V_PAY)
          .addClass('link')
          .on('click', () => {
            this.stack.push({ class: 'net.nanopay.invoice.ui.sme.PayablesView' });
          })
        .end();
        return;
      }
      // receive money
        this.start()
          .add(this.TITLE_REC1).add(this.formattedAmount$).add(this.TITLE_REC2).add(this.invoiceName$)
          .addClass('success-title')
        .end()
        .start()
          .add(this.BODY_REC).add(this.invoiceName$, '.')
          .br()
          .add(this.REF).add(this.invoice.referenceId)
          .addClass('success-body')
        .end()
        .start()
        .br()
          .add(this.V_REC)
          .addClass('link')
          .on('click', () => {
            this.stack.push({ class: 'net.nanopay.invoice.ui.sme.ReceivablesView' });
          })
      .end();

    }
  ]

});
