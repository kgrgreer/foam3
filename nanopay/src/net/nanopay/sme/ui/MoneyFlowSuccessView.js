foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'MoneyFlowSuccessView',
  extends: 'foam.u2.Controller',

  documentation: `
    USAGE:

    1) To get to ReceiveMoney flow success screen
    this.stack.push({
      class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
      invoice: invoice
    });

    2) Sending money as an Approver
    this.stack.push({
      class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
      invoice: invoice,
      isApprover: true
    });
  `,

  imports: [
    'stack',
    'user'
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
    ^img {
      padding: 5px;
      margin: 100px 0px 15px 155px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice'
    },
    {
      class: 'Boolean',
      name: 'isPayable_',
      expression: function(invoice) {
        return invoice.payerId === this.user.id;
      }
    },
    {
      class: 'Boolean',
      name: 'isApprover',
      documentation: `
        Set this to true if you have approver permissions.
      `
    },
    {
      name: 'topImage',
      value: { class: 'foam.u2.tag.Image', data: 'images/canada.svg' }
    },
    {
      class: 'String',
      name: 'formattedAmount_',
      documentation: `
        The amount of the invoice, formatted properly for the destination
        currency of the invoice.
      `
    },
    {
      class: 'String',
      name: 'invoiceName_',
      documentation: `
        The name to display for the invoice. Either the business name or the
        name of the person at that business, depending on what is available.
      `,
      expression: function(invoice, isPayable_) {
        return isPayable_ ?
            (invoice.payee.businessName ? invoice.payee.businessName : invoice.payee.label()) :
            (invoice.payer.businessName ? invoice.payer.businessName : invoice.payer.label());
      }
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
        this.formattedAmount_ = currency.format(this.invoice.amount) + ' ' +
          currency.alphabeticCode;
      });
    },

    function initE() {
      this.populateVariables();
      this.SUPER();
      this.addClass(this.myClass())
        .start(this.topImage)
          .addClass(this.myClass('img'))
        .end();
      if ( this.isPayable_ ) {
        if ( ! this.isApprover ) {
          // pending approval
          this.start()
            .add(this.TITLE_APP)
            .add(this.formattedAmount_$)
            .add(this.TITLE_SEND2)
            .add(this.invoiceName_$)
            .addClass('success-title')
          .end()
          .start()
            .add(this.BODY_APP)
            .add(this.invoiceName_$, '.')
            .br()
            .add(this.REF)
            .add(this.invoice.referenceId)
            .addClass('success-body')
          .end()
          .start()
          .br()
            .add(this.V_PAY)
            .addClass('link')
            .on('click', () => {
              this.stack.push({
                class: 'net.nanopay.invoice.ui.sme.PayablesView'
              });
            })
          .end();
          return;
        }
        // send money
        this.start()
          .add(this.TITLE_SEND1)
          .add(this.formattedAmount_$)
          .add(this.TITLE_SEND2)
          .add(this.invoiceName_$)
          .addClass('success-title')
        .end()
        .start()
          .add(this.BODY_SEND)
          .br()
          .add(this.REF)
          .add(this.invoice.referenceId)
          .addClass('success-body')
        .end()
        .start()
        .br()
          .add(this.V_PAY)
          .addClass('link')
          .on('click', () => {
            this.stack.push({
              class: 'net.nanopay.invoice.ui.sme.PayablesView'
            });
          })
        .end();
        return;
      }
      // receive money
        this.start()
          .add(this.TITLE_REC1)
          .add(this.formattedAmount_$)
          .add(this.TITLE_REC2)
          .add(this.invoiceName_$)
          .addClass('success-title')
        .end()
        .start()
          .add(this.BODY_REC).add(this.invoiceName_$, '.')
          .br()
          .add(this.REF).add(this.invoice.referenceId)
          .addClass('success-body')
        .end()
        .start()
        .br()
          .add(this.V_REC)
          .addClass('link')
          .on('click', () => {
            this.stack.push({
              class: 'net.nanopay.invoice.ui.sme.ReceivablesView'
            });
          })
      .end();
    }
  ]
});
