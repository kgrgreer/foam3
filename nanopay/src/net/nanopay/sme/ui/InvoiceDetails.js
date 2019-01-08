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
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  imports: [
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
      color: #8e9090;
      width: 50%;
    }
    ^ .invoice-text-right {
      display: inline-block;
      vertical-align: top;
      color: #8e9090;
      width: 50%;
      }
    ^ .bold-label {
      color: #2b2b2b;
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
    ^ .sme-invoice-status {
      float: right;
    }
    ^ .invoice-content {
      border-top: solid 1px #e2e2e3;
      margin-top: 23px;
      padding-top: 23px;
    }
    ^ .invoice-row {
      margin-bottom: 32px;
    }
    ^ .invoice-status-container {
      float: right;
    }
    ^attachment {
      text-decoration: underline;
      color: #604aff;
      cursor: pointer;
    }
    ^issue-date-block {
      display: inline-block;
      margin-left: 45px;
    }
  `,

  properties: [
    'invoice',
    {
      name: 'formattedAmount',
      value: '...',
      documentation: 'formattedAmount contains the currency symbol.'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payer',
      factory: function() {
        if ( this.invoice.payer ) {
          return this.PublicUserInfo.create(this.invoice.payer);
        }

        if ( this.invoice.payerId === this.user.id ) {
          return this.PublicUserInfo.create(this.user);
        }

        this.user.contacts.find(this.invoice.contactId).then((user) => {
          this.payer = this.PublicUserInfo.create(user);
        });

        return null;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payee',
      factory: function() {
        if ( this.invoice.payee ) {
          return this.PublicUserInfo.create(this.invoice.payee);
        }

        if ( this.invoice.payeeId === this.user.id ) {
          return this.PublicUserInfo.create(this.user);
        }

        this.user.contacts.find(this.invoice.contactId).then((user) => {
          this.payee = this.PublicUserInfo.create(user);
        });

        return null;
      }
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
          .callOn(this.invoice.STATUS.tableCellFormatter, 'format', [
            this.invoice.STATUS.f ? this.invoice.STATUS.f(this.invoice)
                : null, this.invoice, this.invoice.STATUS
          ])
      .start().addClass('invoice-content')
        .start()
          .addClass('invoice-row')
          .start()
            .addClass('invoice-text-left')
            .start()
              .addClass('bold-label')
              .add(this.PAYER_LABEL)
            .end()
            .add(this.payer$.map(function(payer) {
              if ( payer != null ) {
                var address = payer.businessAddress;
                return self.E()
                  .start().add(payer.businessName).end()
                  .start().add(self.formatStreetAddress(address)).end()
                  .start().add(self.formatRegionAddress(address)).end()
                  .start().add(address ? address.postalCode : ' ').end();
              }
            }))
          .end()
          .start()
            .addClass('invoice-text-left')
            .start().addClass('bold-label').add(this.PAYEE_LABEL).end()
            .add(this.payee$.map(function(payee) {
              if ( payee != null ) {
                return self.E()
                  .start().add(payee.firstName + ' ' + payee.lastName).end()
                  .start().add(payee.businessPhone == null ? ' ' : payee.businessPhone.number).end()
                  .start().add(payee.email).end();
              }
            }))
          .end()
        .end()
        .start()
          .addClass('invoice-row')
          .start()
            .addClass('invoice-text-left')
            .start()
                .addClass('bold-label')
                .add(this.BALANCE_LABEL)
            .end()
            .add(this.formattedAmount$)
            .add(` ${this.invoice.destinationCurrency}`)
          .end()
          .start()
            .addClass('invoice-text-right')
            .start().addClass('inline-block')
              .start()
                .addClass('bold-label')
                .add(this.DUE_DATE_LABEL)
              .end()
              .start().add(dueDate).end()
            .end()
            .start().addClass(this.myClass('issue-date-block'))
              .start()
                .addClass('bold-label')
                .add(this.ISSUE_DATE_LABEL)
              .end()
              .start().add(issueDate).end()
            .end()
          .end()
        .end()
      .end()
      .start()
        .start()
          .add(this.ATTACHMENT_LABEL)
          .addClass('bold-label')
        .end()
        .start()
          .add(this.invoice.invoiceFile.map(function(file) {
            // Iterate to show attachments
            return self.E()
              .start().addClass(self.myClass('attachment'))
                .add(file.filename)
                .on('click', () => {
                  window.open(file.address);
                })
              .end();
          }))
        .end()
      .end()
      .br()
      .start()
        .addClass('bold-label')
        .add(this.NOTE_LABEL)
      .end()
      .start('span')
        .addClass('invoice-note')
        .add(this.invoice.note)
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
    }
  ]
});
