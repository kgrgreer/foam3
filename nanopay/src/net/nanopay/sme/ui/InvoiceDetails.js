foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceDetails',
  extends: 'foam.u2.View',

  documentation: `Reusable invoice details view can show both payables &
                  receivables information`,

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
    'ctrl',
    'publicUserDAO',
    'user'
  ],

  css: `
    ^ .invoice-title {
      width: 360px;
      font-size: 18px;
      display: inline-block;
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
    ^ .sme-invoice-status {
      float: right;
      margin-right: 10px;
    }
  `,

  properties: [
    'invoice',
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
    }
  ],

  messages: [
    { name: 'INVOICE_NUMBER_LABEL', message: 'Invoice #' },
    { name: 'BALANCE_LABEL', message: 'Balance ' },
    { name: 'ISSUE_DATE_LABEL', message: 'Date Issued ' },
    { name: 'DUE_DATE_LABEL', message: 'Date Due ' },
    { name: 'PO_NO_LABEL', message: 'P.O. No. ' },
    { name: 'PAYER_LABEL', message: 'Payment from' },
    { name: 'PAYEE_LABEL', message: 'Payment to' },
    { name: 'ATTACHMENT_LABEL', message: 'Attachments' },
    { name: 'NOTE_LABEL', message: 'Notes' }
  ],

  methods: [
    function initE() {
      var self = this;

      if ( ! this.invoice.payer && this.invoice.payerId ) {
        this.getAccountInfo(this.invoice.payerId).then((user) => {
          this.invoice.payer = user;
        });
      }

      if ( ! this.invoice.payee && this.invoice.payeeId ) {
        this.getAccountInfo(this.invoice.payeeId).then((user) => {
          this.invoice.payee = user;
        });
      }

      // Format the amount & add the currency symbol
      if ( this.invoice.destinationCurrency !== undefined ) {
        this.invoice.destinationCurrency$find.then((currency) => {
          this.formattedAmount = currency.format(this.invoice.amount);
        });
      }

      // Format dueDate & issueDate
      var dueDate = this.invoice.dueDate ?
          this.invoice.dueDate.toISOString().substring(0, 10) : '';
      var issueDate = this.invoice.issueDate ?
          this.invoice.issueDate.toISOString().substring(0, 10): '';

      this.addClass(this.myClass())
        .start()
          .addClass('invoice-title')
          .addClass('text-fade-out')
          .add(this.INVOICE_NUMBER_LABEL + this.invoice.invoiceNumber)
        .end()
        .start()
          .addClass('generic-status')
          .addClass('Invoice-Status-' + this.invoice.status.label.replace(/\W+/g, '-'))
          .addClass('sme-invoice-status')
          .add(this.invoice.status.label)
        .end()
      .br()
      .br()
      .start()
        .start()
          .addClass('invoice-text-left')
          .addClass('text-fade-out')
          .add(this.BALANCE_LABEL)
          .add(this.formattedAmount$)
          .add(` ${this.invoice.destinationCurrency}`)
        .end()
        .start()
          .addClass('invoice-text-right')
          .add(this.ISSUE_DATE_LABEL + issueDate)
        .end()
      .end()
      .start()
        .start()
          .addClass('invoice-text-left')
          .addClass('text-fade-out')
          .add(this.PO_NO_LABEL + this.invoice.purchaseOrder)
        .end()
        .start()
          .addClass('invoice-text-right')
          .add(this.DUE_DATE_LABEL + dueDate)
        .end()
      .end()
      .br()
      .start()
        .start()
          .addClass('invoice-text-left')
          .start()
            .addClass('invoice-text-label')
            .add(this.PAYER_LABEL)
          .end()
          .start().add(this.invoice.dot('payer').dot('businessName')).end()
          .start().add(this.invoice.dot('payer').dot('businessAddress').map((value) => {
            return this.formatStreetAddress(value);
          })).end()
          .start().add(this.invoice.dot('payer').dot('businessAddress').map((value) => {
            return this.formatRegionAddress(value);
          })).end()
          .start().add(this.invoice.dot('payer').dot('businessAddress').dot('postalCode')).end()
          .start().add(this.invoice.dot('payer').dot('businessPhone').dot('number')).end()
          .start().add(this.invoice.dot('payer').dot('email')).end()
        .end()
        .start().addClass('invoice-text-left')
          .start().addClass('invoice-text-label').add(this.PAYEE_LABEL).end()
          .start().add(this.invoice.dot('payee').map((p) => {
            return p ? p.firstName + ' ' + p.lastName : '';
          })).end()
          .start().add(this.invoice.dot('payee').dot('businessPhone').dot('number')).end()
          .start().add(this.invoice.dot('payee').dot('email')).end()
        .end()
      .end()
      .br()
      .start()
        .start()
          .add(this.ATTACHMENT_LABEL)
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
        .add(this.NOTE_LABEL)
      .end()
      .start('span')
        .addClass('invoice-note')
        .add(this.invoice.note)
      .end();
    },

    function formatFileSize(filesize) {
      return Math.ceil(filesize / 1024) + 'K';
    },

    function formatStreetAddress(address) {
      var formattedAddress = '';
      if ( ! address ) return '';
      if ( address.structured ) {
        if ( address.streetNumber ) formattedAddress += address.streetNumber;
        if ( address.streetName ) formattedAddress += ' ' + address.streetName;
        if ( address.suite ) formattedAddress += ' #' + address.suite;
      } else {
        if ( address.address1 ) formattedAddress += address.address1;
        if ( address.address2 ) formattedAddress += ' #' + address.address2;
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

    async function getAccountInfo(id) {
      return await this.publicUserDAO.find(id);
    }
  ]
});
