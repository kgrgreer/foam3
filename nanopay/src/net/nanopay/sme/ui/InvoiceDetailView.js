foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceDetailView',
  extends: 'foam.u2.View',

  documentation: 'Invoice detail view of Payable/Receivable for ablii',

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.invoice.model.InvoiceStatus'
  ],

  imports: [
    'currencyDAO',
    'publicUserDAO',
    'stack',
    'user'
  ],

  css: `
    ^ {
      margin-left: 50px;
      margin-right: 50px;
    }
    ^ .left-block {
      vertical-align: top;
      display: inline-block;
      width: calc(50% - 25px);
      height: 650px;
      margin-right: 5px;
    }
    ^ .right-block {
      vertical-align: top;
      display: inline-block;
      width: calc(50% - 25px);
      height: 650px;
      margin-left: 5px;
    }
    ^ .parent {
      color: #808080;
      margin-left: 15px;
      display: inline-block;
      vertical-align: middle;
    }
    ^ .title {
      font-size: 24px;
      margin-top: 15px;
      margin-bottom: 15px;
    }
    ^ .subtitle {
      width: 360px;
      font-size: 18px;
      display: inline-block;
    }
    ^ .print {
      margin-right: 15px;
    }
    ^ .invoice-text-left {
      display: inline-block;
      vertical-align: top;
      width: 220px;
    }
    ^ .invoice-text-right {
      display: inline-block;
      vertical-align: top;
      width: 220px;
    }
    ^ .invoice-text-label {
      color: #808080;
      margin-bottom: 5px;
    }
    ^ .invoice-note {
      display: inline-block;
      max-height: 260px;
      overflow-y: scroll;
    }
    ^ .text-fade-out {
      background-image: linear-gradient(90deg, #000000 70%, rgba(0,0,0,0));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      overflow: hidden;
      white-space: nowrap;
    }
    ^ .invoice-content {
      background-color: white;
      padding: 14px;
      border-radius: 8px;
    }
    ^ .payment-content {
      background-color: white;
      padding: 14px;
      border-radius: 4px;
      height: 40%;
      margin-bottom: 10px;
    }
    ^ .invoice-history-content {
      background-color: white;
      padding: 14px;
      border-radius: 4px;
      height: calc(650px - 40% - 28px - 10px);
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isPayable',
      documentation: `Denotes whether this view is for a payable
          or a receivable.`
    },
    {
      class: 'FObjectProperty',
      name: 'invoice',
      documentation: 'The invoice object passed from Payables/Receivables view'
    },
    {
      name: 'formattedAmount',
      value: '...'
    }
  ],

  methods: [
    function initE() {
      var self = this;

      // Dynamic create top button based on 'isPayable'
      this.geneareteTop(this.isPayable);

      // Format the amount & add the currency symbol
      this.invoice.destinationCurrency$find.then((currency) => {
        this.formattedAmount = currency.format(this.invoice.amount);
      });

      this.addClass(this.myClass())

          .start().addClass('title').add('Invoice #' +
              this.invoice.invoiceNumber).end()
          .start().style({ 'margin-bottom': '20px' })
            .start('a').addClass('print').add('Print')
            .on('click', function(x) {
              window.print();
            })
            .end()
            .start('a').addClass('print')
              .add('Download as PDF')
              .on('click', function(x) {
                // TODO: download the invoice as pdf
              })
            .end()
          .end()

          .start()
            .start().addClass('left-block').addClass('invoice-content')
              .start()
                .start().addClass('subtitle').addClass('text-fade-out')
                  .add('Invoice #' + this.invoice.invoiceNumber)
                .end()
                .start().style({ 'float': 'right', 'margin-right': '10px' })
                  .addClass('generic-status')
                  .addClass('Invoice-Status-' + this.invoice.status.label)
                  .add(this.invoice.status.label)
                .end()
              .end()
              .br().br()
              .start()
                .start().addClass('invoice-text-left').add('Balance ').addClass('text-fade-out')
                  .add(this.formattedAmount$)
                  .add(' ' + this.invoice.destinationCurrency)
                .end()
                .start().addClass('invoice-text-right')
                  .add('Date Issued ' + this.invoice.issueDate
                      .toISOString().substring(0, 10))
                .end()
              .end()
              .start()
                .start().addClass('invoice-text-left')
                  .addClass('text-fade-out')
                  .add('P.O. No. '+ this.invoice.purchaseOrder)
                .end()
                .start().addClass('invoice-text-right')
                  .add('Date Due ' + this.invoice.dueDate
                      .toISOString().substring(0, 10))
                .end()
              .end()
              .br()
              .start()
                .start().addClass('invoice-text-left')
                  .start().add('Payment from').addClass('invoice-text-label').end()
                  .start().add(this.invoice.payer.organization).end()
                  .start().add(this.invoice.payer.businessAddress.address1 + ' ' + this.invoice.payer.businessAddress.address2).end()
                  .start().add(this.invoice.payer.businessAddress.city + ', ' + this.invoice.payer.businessAddress.regionId + ', ' + this.invoice.payer.businessAddress.countryId).end()
                  .start().add(this.invoice.payer.businessPhone.number).end()
                  .start().add(this.invoice.payer.email).end()
                .end()
                .start().addClass('invoice-text-left')
                  .start().addClass('invoice-text-label').add('Payment to').end()
                  .start().add(this.invoice.payee.firstName).end()
                  .start().add(this.invoice.payee.businessPhone.number).end()
                  .start().add(this.invoice.payee.email).end()
                .end()
              .end()
              .br()
              .start()
                .start().add('Attachments').addClass('invoice-text-label').end()
                .start()
                  .add(this.invoice.invoiceFile.map(function(file) {
                    // Iterate to show attachments
                    return self.E()
                      .start('a')
                        .add(file.filename + ' ('+ self.formatFileSize(file.filesize) + ')')
                        .attrs({ href: file.address })
                      .end();
                  }))
                .end()
              .end()
              .br()
              .start().addClass('invoice-text-label').add('Notes').end()
              .start('span').addClass('invoice-note').add(this.invoice.note).end()
            .end()
            .start().addClass('right-block')
              .start().addClass('payment-content').addClass('invoice-text-label').add('Payment Details').end()
              .start().addClass('invoice-history-content')
                .start().add('Invoice History').addClass('invoice-text-label').end()
                .start({
                  class: 'net.nanopay.invoice.ui.history.InvoiceHistoryView',
                  id: this.invoice.id
                }).style({ 'height': '270px', 'overflow-y': 'scroll' }).end()
              .end()
            .end()
          .end()
        .end();
    },

    function geneareteTop(isPayable) {
      if ( isPayable ) {
        var parent = 'Payables';
        var action = this.PAY_NOW;
      } else {
        var parent = 'Receivables';
        var action = this.RECORD_PAYMENT;
      }
      this.start()
        .start().style({ 'display': 'inline-block',
          'vertical-align': 'middle' })
          .start({ class: 'foam.u2.tag.Image',
              data: 'images/ic-cancel.svg'
            })
            .on('click', () => {
              this.stack.back();
            })
          .end()
        .end()
        .start().addClass('parent').add(parent).end()
        .start(action)
          .addClass('sme-button')
          .style({ 'float': 'right' })
        .end()
      .end();
    },

    function formatFileSize(filesize) {
      return Math.ceil(filesize / 1024) + 'K';
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      code: function() {
        // TODO: redirect to invoice payment page
      }
    },
    {
      name: 'recordPayment',
      label: 'Record Payment',
      code: function() {
        // TODO: redirect to invoice record payment popup
      }
    }
  ]
});
