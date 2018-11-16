foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceOverview',
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
    'publicUserDAO',
    'stack',
    'user'
  ],

  messages: [
    {
      name: 'BACK',
      message: 'Go back'
    }
  ],

  css: `
    ^ {
      width: 1024px;
      margin: auto;
      padding: 24px;
    }
    ^ .left-block {
      vertical-align: top;
      display: inline-block;
      width: calc(50% - 25px);
      margin-right: 5px;
    }
    ^ .right-block {
      vertical-align: top;
      display: inline-block;
      width: calc(50% - 40px);
      margin-left: 40px;
    }
    ^back-area {
      cursor: pointer;
      display: flex;
      align-items: center;
      color: #8e9090;
      font-size: 16px;
      font-weight: 400;
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
    ^ .payment-content {
      padding: 0px 14px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    ^ .invoice-history-content {
      padding: 14px;
      border-radius: 4px;
    }
    ^ .actions-wrapper {
      padding: 23px 0px 34px;
    }

    ^ .net-nanopay-ui-ActionView-payNow {
      width: 158px;
    }
    ^back-arrow {
      font-size: 20pt;
    }
    ^top-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    ^ .invoice-row {
      margin-bottom: 24px;
    }
    ^ .invoice-text-left {
      display: inline-block;
      vertical-align: top;
      color: #8e9090;
      width: 50%;
    }
    ^ .invoice-text-right {
      display: inline-block;
      vertical-align: top;
      color: #8e9090;
      width: 50%;
    }
    ^ .subheading {
      margin-bottom: 16px;
    }

    ^ .foam-u2-history-HistoryView {
      background: none;
      padding-left: 0px;
      margin-left: -13px;
      height: auto;
    }

    ^ .net-nanopay-invoice-ui-history-InvoiceHistoryView {
      height: auto;
    }

    ^ .foam-u2-history-HistoryView h2 {
      display: none;
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
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice',
      documentation: 'The invoice object passed from Payables/Receivables view.'
    },
  ],

  methods: [
    function initE() {
      // Dynamic create top button based on 'isPayable'
      this.generateTop(this.isPayable);


      this
        .addClass(this.myClass())
        .start()
          .start()
            .addClass('x-large-header')
            .add('Invoice #' + this.invoice.invoiceNumber)
          .end()
        .end()
        .start()
          .addClass('actions-wrapper')
          .start(this.PRINT)
            .addClass('sme').addClass('link')
            .start('img').addClass('icon').attr('src', 'images/print-resting.svg').end()
            .start('img').addClass('icon').addClass('hover').attr('src', 'images/print-hover.svg').end()
          .end()
          .start(this.DOWNLOAD_AS_PDF)
            .addClass('sme').addClass('link')
              .start('img').addClass('icon').attr('src', 'images/export-icon-resting.svg').end()
              .start('img').addClass('icon').addClass('hover').attr('src', 'images/export-icon-hover.svg').end()
          .end()
        .end()

        .start()
          .start()
            .addClass('left-block')
            .addClass('invoice-content')
            .tag({ class: 'net.nanopay.sme.ui.InvoiceDetails', invoice: this.invoice })
          .end()
          .start()
            .addClass('right-block')
            // TODO: Actually implement the payment details.
            .start()
              .addClass('payment-content')
              .start()
                .addClass('subheading')
                .add('Payment details')
              .end()
              .start().addClass('invoice-row')
                .start().addClass('invoice-text-left')
                  .start().addClass('table-content').add('Requested amount').end()
                  .add('$5,400.00 CAD')
                .end()
                .start().addClass('invoice-text-right')
                  .start().addClass('table-content').add('Sent amount').end()
                  .add('$5,400.00 CAD')
                .end()
              .end()
              .start().addClass('invoice-row')
                .start().addClass('invoice-text-left')
                  .start().addClass('table-content').add('Sent from').end()
                  .add('RBC **0392')
                .end()
                .start().addClass('invoice-text-right')
                  .start().addClass('table-content').add('Paid date').end()
                  .add('N/A')
                .end()
              .end()
              .start().addClass('invoice-row')
                .start().addClass('invoice-text-left')
                  .start().addClass('table-content').add('Exchange rate').end()
                  .add('1 CAD @ 0.7898 USD')
                .end()
                .start().addClass('invoice-text-right')
                  .start().addClass('table-content').add('Fee').end()
                  .add('$0.75')
                .end()
              .end()
            .end()
            .start()
              .addClass('invoice-history-content')
              .start()
                .addClass('subheading')
                .add('History')
              .end()
              .start({
                class: 'net.nanopay.invoice.ui.history.InvoiceHistoryView',
                id: this.invoice.id
              }).end()
            .end()
          .end()
        .end()
      .end();
    },

    function generateTop(isPayable) {
      if ( isPayable ) {
        var action = this.PAY_NOW;
      } else {
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
                .add(this.BACK)
              .end()
              .on('click', this.goBack)
            .end()
            .start(action).addClass('sme').addClass('button').addClass('primary').end()
          .end()
        .endContext();
    }
  ],

  listeners: [
    function goBack(X) {
      this.stack.back();
    }
  ],

  actions: [
    {
      name: 'payNow',
      label: 'Pay now',
      isAvailable: function() {
        return this.invoice.paymentMethod === this.PaymentStatus.NONE ||
          this.invoice.draft ||
          this.invoice.paymentMethod === this.PaymentStatus.PENDING_APPROVAL;
        // TODO: auth.check(this.user, 'invoice.pay');
      },
      code: function(X) {
        this.stack.push({
          class: 'net.nanopay.sme.ui.SendRequestMoney',
          isPayable: this.isPayable,
          isForm: false,
          isDetailView: true,
          hasSaveOption: false,
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
        // TODO: add download as PDF feature
        alert('Not implemented yet!');
      }
    }
  ]
});
