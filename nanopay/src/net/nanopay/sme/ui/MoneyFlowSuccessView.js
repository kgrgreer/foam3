/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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

  requires: [
    'net.nanopay.tx.ConfirmationFileLineItem'
  ],

  imports: [
    'auth',
    'currencyDAO',
    'invoiceDAO',
    'menuDAO',
    'stack',
    'transactionDAO',
    'subject',
    'crunchService'
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
    pre {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
        return invoice.payerId === this.subject.user.id;
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
            'images/exclamation-large-orange.svg' :
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
        return isPayable_ ? invoice.payee.toSummary() : invoice.payer.toSummary();
      }
    },
    {
      class: 'String',
      name: 'title_',
      expression: function(isPayable_, isApprover_, formattedAmount_, invoiceName_) {
        if ( isPayable_ ) {
          if ( isApprover_ ) {
            return this.TITLE_SEND;
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
    },
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'transactionConfirmationPDF',
      documentation: `Order confirmation, as a PDF, for the Payer.
    `
    },
    {
      class: 'String',
      name: 'cnpj'
    }
  ],

  messages: [
    { name: 'TITLE_SEND', message: 'You’re almost there!' },
    { name: 'TITLE_REC1', message: 'Requested' },
    { name: 'TITLE_REC2', message: 'from' },
    { name: 'TITLE_PENDING', message: 'Payment has been submitted for approval' },
    { name: 'BODY_SEND', message: 'You will see the debit from your bank account in 1-2 business days.' },
    { name: 'BODY_REC', message: 'Your request has been sent to your contact and is now pending payment.' },
    { name: 'BODY_PENDING', message: 'This payable requires approval before it can be processed.' },
    { name: 'REF', message: 'Your reference ID ' },
    { name: 'V_PAY', message: 'View this invoice' },
    { name: 'V_REC', message: 'View this receivable' },
    { name: 'TXN_CONFIRMATION_LINK_TEXT', message: 'View AscendantFX Transaction Confirmation' },
    { name: 'BODY_SEND_TREVISO_1', message: 'Attention : this transaction is not complete yet!' },
    { name: 'BODY_SEND_TREVISO_2_0', message: 'Send a TED of ' },
    { name: 'BODY_SEND_TREVISO_2_1', message: ' within 4 hours to:' },
    { name: 'BODY_SEND_TREVISO_3', message: 'Company: Treviso Corretora de Câmbio S.A' },
    { name: 'BODY_SEND_TREVISO_4', message: 'CNPJ: 02.992.317/0001-87' },
    { name: 'BODY_SEND_TREVISO_5', message: 'Bank: Banco SC Treviso (143)' },
    { name: 'BODY_SEND_TREVISO_6', message: 'Institution: 0001' },
    { name: 'BODY_SEND_TREVISO_7', message: 'Account: 1-1' },
    { name: 'BODY_SEND_TREVISO_8', message: 'Reference: ' },
    { name: 'BODY_SEND_TREVISO_9_0', message: 'If the TED above is not received within 4 hours, the payment of ' },
    { name: 'BODY_SEND_TREVISO_9_1', message: ' to ' },
    { name: 'BODY_SEND_TREVISO_9_2', message: ' will be cancelled.' },

  ],

  methods: [
    function populateVariables() {
      this.currencyDAO.find(this.invoice.destinationCurrency)
        .then((currency) => {
        this.formattedAmount_ = currency.format(this.invoice.amount);
      });

      this.crunchService.getJunction(null,"crunch.onboarding.br.business-identification")
        .then((ucj) => {
          this.cnpj = ucj.data.cnpj;
      });
    },
    function init() {
      this.transactionDAO.find(this.invoice.paymentId).then((transaction) => {
        if ( transaction ) {
          for ( var i = 0; i < transaction.lineItems.length; i++ ) {
            if ( this.ConfirmationFileLineItem.isInstance( transaction.lineItems[i] ) ) {
              this.transactionConfirmationPDF = transaction.lineItems[i].file;
              break;
            }
          }
        }
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
            .add(this.getBody())
          .end()
          .start('a')
            .addClass('link')
            .add(this.isPayable_$.map((value) => value ? this.V_PAY : this.V_REC))
            .on('click', async () => {
              this.invoice = await this.invoiceDAO.find(this.invoice.id);
              this.stack.push({
                class: 'net.nanopay.sme.ui.InvoiceOverview',
                invoice$: this.invoice$,
                isPayable: this.isPayable_
              });
            })
          .end()
          .add(this.slot(function(transactionConfirmationPDF) {
            if ( transactionConfirmationPDF != null ) {
              return this.E().start()
              .tag({
                class: 'net.nanopay.sme.ui.Link',
                data: self.transactionConfirmationPDF.address,
                text: self.TXN_CONFIRMATION_LINK_TEXT
              });
            }
          }))
        .end()
        .start('div').addClass('navigationContainer')
          .start('div').addClass('buttonContainer')
            .tag(this.DONE)
          .end()
        .end();
    },
    function getBody() {
      if ( this.isPayable_ && this.isApprover_ ) {
        return this.E()
          .start()
            .add(this.BODY_SEND_TREVISO_2_0 + this.invoice.totalSourceAmount + this.BODY_SEND_TREVISO_2_1)
          .end()
          .start().add(this.BODY_SEND_TREVISO_3).end()
          .start().add(this.BODY_SEND_TREVISO_4).end()
          .start().add(this.BODY_SEND_TREVISO_5).end()
          .start().add(this.BODY_SEND_TREVISO_6).end()
          .start().add(this.BODY_SEND_TREVISO_7).end()
          .start()
            .add(this.BODY_SEND_TREVISO_8)
            .add(this.cnpj$)
          .end()
          .start('b')
            .add(this.BODY_SEND_TREVISO_9_0 + this.invoice.totalSourceAmount + this.BODY_SEND_TREVISO_9_1 +
              (this.invoice.payee.organization || this.invoice.payee.businessName) + this.BODY_SEND_TREVISO_9_2)
          .end();
      } else if ( this.isPayable_ ) {
        return this.BODY_PENDING;
      } else {
        return this.BODY_REC;
      }
    },
  ],

  actions: [
    {
      name: 'done',
      label: 'Done',
      code: function(X) {
        var menuId = this.isPayable_ ?
            'mainmenu.invoices.payables' :
            'mainmenu.invoices.receivables';
        this.menuDAO
          .find(menuId)
          .then((menu) => menu.launch());
      }
    }
  ]
});
