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
    ^ {
      background: #fff;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #e2e2e3;
      padding: 24px;
    }
    ^ .invoice-title {
      width: 360px;
      font-size: 18px;
      display: inline-block;
    }
    ^ .invoice-text-left {
      display: inline-block;
      vertical-align: top;
      width: 50%;
    }
    ^ .invoice-text-right {
      display: inline-block;
      vertical-align: top;
      width: 50%;
      }
    ^ .invoice-text-label {
      font-weight: 700;
      line-height: 21px;
      font-size: 14px;
      color: #2b2b2b;
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
    ^ .sme-invoice-status {
      float: right;
    }
    ^ .invoice-content {
      border-top: solid 1px #e2e2e3;
      margin-top: 23px;
      padding-top: 23px;
      font-size: 14px;
      font-weight: 400;
      line-height: 21px;
      color: #8e9090;
    }
    ^ .invoice-row {
      margin-bottom: 32px;
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
    { name: 'BALANCE_LABEL', message: 'Balance due' },
    { name: 'ISSUE_DATE_LABEL', message: 'Date issued' },
    { name: 'DUE_DATE_LABEL', message: 'Date due' },
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
          .addClass('medium-header')
          .addClass('inline')
          .add(this.INVOICE_NUMBER_LABEL + this.invoice.invoiceNumber)
        .end()
        .start()
          .addClass('generic-status')
          .addClass('Invoice-Status-' + this.invoice.status.label.replace(/\W+/g, '-'))
          .addClass('sme-invoice-status')
          .add(this.invoice.status.label)
        .end()
      .start().addClass('invoice-content')
        .start()
          .addClass('invoice-row')
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
        .start()
          .addClass('invoice-row')
          .start()
            .addClass('invoice-text-left')
            .start()
                .addClass('invoice-text-label')
                .add(this.BALANCE_LABEL)
            .end()
            .add(this.formattedAmount$)
            .add(` ${this.invoice.destinationCurrency}`)
          .end()
          .start()
            .addClass('invoice-text-right')
            .start()
                .addClass('invoice-text-label')
                .add(this.DUE_DATE_LABEL)
            .end()
            .add(dueDate)
          .end()
        .end()
      .end()
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
