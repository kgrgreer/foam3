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
    'currencyDAO',
    'menuDAO',
    'stack',
    'user'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
      background: /*%GREY5%*/ #f5f7fa;
    }
    ^ .link {
      color: #7404EA;
      cursor: pointer;
      font-size: 16px;
      text-align: center;
    }
    ^ .success-title {
      margin-bottom: 30px;
      text-align: center
    }
    ^ .success-body {
      font-size: 16px;
      line-height: 24px;
    }
    ^success-img {
      width: 53px;
      height: 53px;
      margin-bottom: 30px;
    }
    ^ .success-content {
      text-align: center;
      position: absolute;
      top: 35%;
      left: 50%;
      margin-right: -50%;
      transform: translate(-50%, -50%);
    }
    ^ .navigationContainer {
      position: fixed;
      width: 100%;
      left: 0;
      bottom: 0;
      background-color: white;
      z-index: 100;
      padding: 10px 0;
    }
    ^ .buttonContainer {
      width: 300px;
      float: right;
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
      expression: function(isApprover_) {
        return {
          class: 'foam.u2.tag.Image',
          data: isApprover_ ?
            'images/checkmark-large-green.svg' :
            'images/pending-icon.svg'
        };
      }
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
          return this.TITLE_PENDING;
        }
        return `${this.TITLE_REC1} ${formattedAmount_} ${this.TITLE_REC2} ${invoiceName_}`;
      }
    },
    {
      class: 'String',
      name: 'body_',
      expression: function(isPayable_, isApprover_, formattedAmount_, invoiceName_) {
        return isPayable_ ?
          (isApprover_ ? this.BODY_SEND : this.BODY_PENDING) : this.BODY_REC;
      }
    }
  ],

  messages: [
    { name: 'TITLE_SEND1', message: 'Sent' },
    { name: 'TITLE_SEND2', message: 'to' },
    { name: 'TITLE_REC1', message: 'Requested' },
    { name: 'TITLE_REC2', message: 'from' },
    { name: 'TITLE_PENDING', message: 'Payment has been submitted for approval' },
    { name: 'BODY_SEND', message: 'You will see the debit from your bank account in 1-2 business days.' },
    { name: 'BODY_REC', message: 'Your request has been sent to your contact and is now pending payment.' },
    { name: 'BODY_PENDING', message: 'This payable requires approval before it can be processed.' },
    { name: 'REF', message: 'Your reference ID ' },
    { name: 'V_PAY', message: 'View this payable' },
    { name: 'V_REC', message: 'View this receivable' },
    { name: 'TXN_CONFIRMATION_LINK_TEXT', message: 'View AscendantFX Transaction Confirmation' }
  ],

  methods: [
    function populateVariables() {
      this.currencyDAO.find(this.invoice.destinationCurrency)
        .then((currency) => {
        this.formattedAmount_ = currency.format(this.invoice.amount);
      });
      this.auth.check(null, 'invoice.pay').then((result) => {
        this.isApprover_ = result;
      });
    },

    function initE() {
      var self = this;
      this.populateVariables();
      this.SUPER();
      this
        .addClass(this.myClass())
        .start().addClass('success-content')
          .add(this.slot(function(topImage) {
            return this.E().start(topImage)
              .addClass(this.myClass('success-img'))
            .end();
          }))
          .start()
            .addClass('success-title').addClass('medium-header')
            .add(this.title_$)
          .end()
          .start('p')
            .addClass('success-body').addClass('subdued-text')
            .add(this.body_$)
          .end()
          .start('p')
            .addClass('success-body').addClass('subdued-text')
            .add(this.REF)
            .add(this.invoice.referenceId)
          .end()
          .start('a')
            .addClass('link')
            .add(this.isPayable_$.map((value) => value ? this.V_PAY : this.V_REC))
            .on('click', () => {
              this.stack.push({
                class: 'net.nanopay.sme.ui.InvoiceOverview',
                invoice: this.invoice,
                isPayable: this.isPayable_
              });
            })
          .end()
          .callIf(this.invoice.AFXConfirmationPDF != null, function() {
            this
              .start()
                .tag({
                  class: 'net.nanopay.sme.ui.Link',
                  data: self.invoice.AFXConfirmationPDF.address,
                  text: self.TXN_CONFIRMATION_LINK_TEXT
                })
              .end();
          })
        .end()
        .start('div').addClass('navigationContainer')
          .start('div').addClass('buttonContainer')
            .tag(this.DONE)
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'done',
      label: 'Done',
      code: function(X) {
        var menuId = this.isPayable_ ?
            'sme.main.invoices.payables' :
            'sme.main.invoices.receivables';
        this.menuDAO
          .find(menuId)
          .then((menu) => menu.launch());
      }
    }
  ]
});
