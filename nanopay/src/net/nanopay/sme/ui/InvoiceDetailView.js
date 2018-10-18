foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceDetailView',
  extends: 'foam.u2.View',

  documentation: `
    Invoice detail view of Payable/Receivable for Ablii.
    Displays invoice information, transaction details and
    invoice changes (Invoice history).
  `,

  implements: [
    'foam.mlang.Expressions',
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'ctrl',
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
    ^back-area {
      cursor: pointer;
      display: flex;
      align-items: center;
    }
    ^ .parent {
      margin-left: 15px;
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
    ^back-arrow {
      font-size: 20pt;
    }
    ^top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
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
      documentation: 'The invoice object passed from Payables/Receivables view.'
    },
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
    }
  ],

  methods: [
    function initE() {
      var self = this;
      // Dynamic create top button based on 'isPayable'
      this.generateTop(this.isPayable);

      // Format the amount & add the currency symbol
      this.invoice.destinationCurrency$find.then((currency) => {
        this.formattedAmount = currency.format(this.invoice.amount);
      });

      // Format dueDate & issueDate
      var dueDate = this.invoice.dueDate ?
          this.invoice.dueDate.toISOString().substring(0, 10) : '';
      var issueDate = this.invoice.issueDate ?
          this.invoice.issueDate.toISOString().substring(0, 10): '';

      this
        .addClass(this.myClass())
        .start()
          .start('h1')
            .add('Invoice #' + this.invoice.invoiceNumber)
          .end()
        .end()
        .start()
          .style({ 'margin-bottom': '20px' })
          .start(this.PRINT)
            .addClass('print')
          .end()
          .start(this.DOWNLOAD_AS_PDF)
            .addClass('print')
          .end()
        .end()

        .start()
          .start()
            .addClass('left-block')
            .addClass('invoice-content')
            .start()
              .start()
                .addClass('subtitle')
                .addClass('text-fade-out')
                .add('Invoice #' + this.invoice.invoiceNumber)
              .end()
              .start()
                .style({ 'float': 'right', 'margin-right': '10px' })
                .addClass('generic-status')
                .addClass('Invoice-Status-' + this.invoice.status.label)
                .add(this.invoice.status.label)
              .end()
            .end()
            .br()
            .br()
            .start()
              .start()
                .addClass('invoice-text-left')
                .addClass('text-fade-out')
                .add('Balance ')
                .add(this.formattedAmount$)
                .add(' ' + this.invoice.destinationCurrency)
              .end()
              .start()
                .addClass('invoice-text-right')
                .add('Date Issued ' + issueDate)
              .end()
            .end()
            .start()
              .start()
                .addClass('invoice-text-left')
                .addClass('text-fade-out')
                .add('P.O. No. '+ this.invoice.purchaseOrder)
              .end()
              .start()
                .addClass('invoice-text-right')
                .add('Date Due ' + dueDate)
              .end()
            .end()
            .br()
            .start()
              .start()
                .addClass('invoice-text-left')
                .start()
                  .addClass('invoice-text-label')
                  .add('Payment from')
                .end()
                .start().add(this.invoice.dot('payer').dot('businessName')).end()
                .start().add(this.formatStreetAddress(this.invoice.payer.businessAddress)).end()
                .start().add(this.formatRegionAddress(this.invoice.payer.businessAddress)).end()
                .start().add(this.invoice.dot('payer').dot('businessAddress').dot('postalCode')).end()
                .start().add(this.invoice.dot('payer').dot('businessPhone').dot('number')).end()
                .start().add(this.invoice.dot('payer').dot('email')).end()
              .end()
              .start().addClass('invoice-text-left')
                .start().addClass('invoice-text-label').add('Payment to').end()
                .start().add(this.invoice.dot('payee').map((p) => {
                  return p.label();
                })).end()
                .start().add(this.invoice.dot('payee').dot('businessPhone').dot('number')).end()
                .start().add(this.invoice.dot('payee').dot('email')).end()
              .end()
            .end()
            .br()
            .start()
              .start()
                .add('Attachments')
                .addClass('invoice-text-label')
              .end()
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
            .start()
              .addClass('invoice-text-label')
              .add('Notes')
            .end()
            .start('span')
              .addClass('invoice-note')
              .add(this.invoice.note)
            .end()
          .end()
          .start()
            .addClass('right-block')
            .start()
              .addClass('payment-content')
              .addClass('invoice-text-label')
              .add('Payment Details')
            .end()
            .start()
              .addClass('invoice-history-content')
              .start()
                .addClass('invoice-text-label')
                .add('Invoice History')
              .end()
              .start({
                class: 'net.nanopay.invoice.ui.history.InvoiceHistoryView',
                id: this.invoice.id
              }).style({ 'height': '270px', 'overflow-y': 'scroll' }).end()
            .end()
          .end()
        .end()
      .end();
    },

    function formatStreetAddress(address) {
      var formattedAddress = '';
      if ( ! address ) return '';
      if ( address.structured ) {
        if ( address.streetNumber ) formattedAddress += address.streetNumber;
        if ( address.streetName ) formattedAddress += ' ' + address.streetName;
        if ( address.suite ) formattedAddress += ' #' + address.suite;
      } else {
        var formattedAddress = address.address1 + ' #' + address.address2;
      }
      return formattedAddress;
    },

    function formatRegionAddress(address) {
      var formattedAddress = '';
      if ( ! address ) return '';
      if ( address.city ) formattedAddress += address.city;
      if ( address.regionId ) {
        formattedAddress ? formattedAddress += ', ' + address.regionId
            : formattedAddress += address.regionId;
      }
      if ( address.countryId ) {
        formattedAddress ? formattedAddress += ', ' + address.countryId
            : formattedAddress += address.countryId;
      }
      return formattedAddress;
    },

    function generateTop(isPayable) {
      if ( isPayable ) {
        var parent = 'Payables';
        var action = this.PAY_NOW;
      } else {
        var parent = 'Receivables';
        var action = this.RECORD_PAYMENT;
      }
      // 'startContext' is required to pass the context to the button
      this
        .startContext({ data: this })
          .start()
            .addClass(this.myClass('top-bar'))
            .start()
              .addClass(this.myClass('back-area'))
              .start('span')
                .addClass(this.myClass('back-arrow'))
                .add('←')
              .end()
              .start('span')
                .addClass('parent')
                .add(parent)
              .end()
              .on('click', () => {
                this.stack.back();
              })
            .end()
            .tag(action)
          .end()
        .endContext();
    },

    function formatFileSize(filesize) {
      return Math.ceil(filesize / 1024) + 'K';
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function() {
        return this.invoice.paymentMethod === this.PaymentStatus.NONE;
      },
      code: function(X) {
        this.stack.push({
          class: 'net.nanopay.ui.transfer.TransferWizard',
          type: 'regular',
          invoice: this.invoice
        });
      }
    },
    {
      name: 'recordPayment',
      label: 'Record Payment',
      isAvailable: function() {
        return this.invoice.paymentMethod === this.PaymentStatus.NONE;
      },
      code: function(X) {
        // TODO: Update the redirection to record payment popup
        ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({
          class: 'net.nanopay.invoice.ui.modal.RecordPaymentModal',
          invoice: this.invoice
        }));
      }
    },
    {
      name: 'print',
      label: 'Print',
      code: function(X) {
        window.print();
      }
    },
    {
      name: 'downloadAsPDF',
      label: 'Download as PDF',
      code: function(X) {
        // TODO
        alert('Not implemented yet!');
      }
    }
  ]
});
