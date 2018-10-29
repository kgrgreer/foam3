foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'MoneyFlowSuccessView',
  extends: 'foam.u2.Controller',

  documentation: `
    USAGE:

    // To get to ReceiveMoney flow success screen
    this.stack.push({
      class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
      invoice: invoice
    });
  `,

  imports: [
    'auth',
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
      name: 'isApprover_',
      documentation: `
        True if the user has permission to approve and pay invoices.
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
    },
    {
      class: 'String',
      name: 'title_',
      expression: function(isPayable_, isApprover_, formattedAmount_, invoiceName_) {
        if ( isPayable_ ) {
          if ( isApprover_ ) {
            return `${this.TITLE_SEND1} ${formattedAmount_} ${this.TITLE_SEND2} ${invoiceName_}`;
          }
          return `${this.TITLE_APP} ${formattedAmount_} ${this.TITLE_SEND2} ${invoiceName_}`;
        }
        return `${this.TITLE_REC1} ${formattedAmount_} ${this.TITLE_REC2} ${invoiceName_}`;
      }
    },
    {
      class: 'String',
      name: 'body_',
      expression: function(isPayable_, isApprover_, formattedAmount_, invoiceName_) {
        return isPayable_ ?
          (isApprover_ ? this.BODY_SEND : this.BODY_APP) :
          `${this.BODY_REC} ${invoiceName_}`;
      }
    }
  ],

  messages: [
    { name: 'TITLE_SEND1', message: 'Sent' },
    { name: 'TITLE_SEND2', message: 'to' },
    { name: 'TITLE_REC1', message: 'Requested' },
    { name: 'TITLE_REC2', message: 'from' },
    { name: 'TITLE_APP', message: 'Pending approval for' },

    { name: 'BODY_SEND', message: 'Invoice status has changed to Paid.' },
    { name: 'BODY_REC', message: 'This invoice is pending payment from ' },
    { name: 'BODY_APP', message: 'Invoice status will change to Paid when this payment is approved and paid by an approver in your business.' },

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
      this.auth.check(null, 'invoice.pay').then((result) => {
        this.isApprover_ = result;
      });
    },

    function initE() {
      this.populateVariables();
      this.SUPER();
      this
        .addClass(this.myClass())
        .start(this.topImage)
          .addClass(this.myClass('img'))
        .end()
        .start()
          .addClass('success-title')
          .add(this.title_$)
        .end()
        .start('p')
          .addClass('success-body')
          .add(this.body_$)
          .br()
          .add(this.REF)
          .add(this.invoice.referenceId)
        .end()
        .start('p')
          .addClass('link')
          .add(this.isPayable_$.map((value) => value ? this.V_PAY : this.V_REC))
          .on('click', () => {
            this.stack.push({
              class: 'net.nanopay.sme.ui.InvoiceOverview',
              invoice: this.invoice,
              isPayable: this.isPayable_
            });
          })
        .end();
    }
  ]
});
