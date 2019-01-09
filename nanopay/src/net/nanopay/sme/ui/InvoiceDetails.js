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
    'foam.core.PromiseSlot',
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
      margin-top: -35px;
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
    ^ .print-wrapper {
      margin-left: 400px;
    }
  `,

  properties: [
    'invoice',
    {
      name: 'formattedAmount',
      documentation: 'formattedAmount contains the currency symbol.',
      expression: function(invoice, invoice$destinationCurrency, invoice$amount) {
        // Format the amount & add the currency symbol
        if ( invoice$destinationCurrency !== undefined ) {
          return invoice.destinationCurrency$find.then((currency) => {
            return currency.format(invoice$amount);
          });
        }
        return Promise.resolve();
      },
    },
    {
      name: 'payer',
      expression: function(invoice$payer, invoice$payerId, user$id, user, invoice$contactId) {
        if ( ! invoice$payer && invoice$payerId ) {
          if ( invoice$payerId === user$id ) {
            return Promise.resolve(this.PublicUserInfo.create(user));
          } else {
            return Promise.resolve(user.contacts.find(invoice$contactId).then(
              (u) => this.PublicUserInfo.create(u)
            ));
          }
        } else {
          return Promise.resolve(invoice$payer);
        }
      },
    },
    {
      name: 'dueDate',
      expression: function(invoice$dueDate) {
        return invoice$dueDate ?
          invoice$dueDate.toISOString().substring(0, 10) : '';
      },
    },
    {
      name: 'issueDate',
      expression: function(invoice$issueDate) {
        return invoice$issueDate ?
          invoice$issueDate.toISOString().substring(0, 10): '';
      },
    },
    {
      name: 'payee',
      expression: function(invoice$payee, invoice$payeeId, user$id, user, invoice$contactId) {
        if ( ! invoice$payee && invoice$payeeId ) {
          if ( invoice$payeeId === user$id ) {
            return Promise.resolve(this.PublicUserInfo.create(user));
          } else {
            return Promise.resolve(user.contacts.find(invoice$contactId).then(
              (u) => this.PublicUserInfo.create(u)));
          }
        } else {
          return Promise.resolve(invoice$payee);
        }
      },
    }
  ],

  messages: [
    { name: 'ATTACHMENT_LABEL', message: 'Attachments' },
    { name: 'BALANCE_LABEL', message: 'Balance due' },
    { name: 'DUE_DATE_LABEL', message: 'Date due' },
    { name: 'INVOICE_NUMBER_LABEL', message: 'Invoice #' },
    { name: 'ISSUE_DATE_LABEL', message: 'Date issued' },
    { name: 'NOTE_LABEL', message: 'Notes' },
    { name: 'PAYEE_LABEL', message: 'Payment to' },
    { name: 'PAYER_LABEL', message: 'Payment from' },
    { name: 'PO_NO_LABEL', message: 'P.O. No. ' },
    { name: 'PRINT_ICON', message: 'images/print-resting.svg' },
    { name: 'PRINT_ICON_HOVER', message: 'images/print-hover.svg' },
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .addClass('medium-header')
          .addClass('inline')
          .add(this.slot(function(invoice$invoiceNumber) {
            return self.INVOICE_NUMBER_LABEL + invoice$invoiceNumber;
          }))
        .end()
        .add(this.slot(function(invoice, invoice$status) {
          var e = self.E();
          invoice.STATUS.tableCellFormatter.format(
            e, invoice$status, invoice, invoice.STATUS);
          return e;
        }))
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
                return payer.then(function(payer) {
                  if ( payer != null ) {
                    var address = payer.businessAddress;
                    return self.E()
                      .start().add(payer.businessName).end()
                      .start().add(self.formatStreetAddress(address)).end()
                      .start().add(self.formatRegionAddress(address)).end()
                      .start().add(address.postalCode).end();
                  }
                });
              }))
            .end()
            .start()
              .addClass('invoice-text-left')
              .start().addClass('bold-label').add(this.PAYEE_LABEL).end()
              .add(this.payee$.map(function(payee) {
                return payee.then(function(payee) {
                  if ( payee != null ) {
                    return self.E()
                      .start().add(payee.firstName + ' ' + payee.lastName).end()
                      .start().add(payee.businessPhone.number).end()
                      .start().add(payee.email).end();
                  }
                });
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
              .add(this.PromiseSlot.create({
                promise$: this.formattedAmount$,
                initialValue: '...',
              }))
              .add(this.invoice$.dot('destinationCurrency'))
            .end()
            .start()
              .addClass('invoice-text-right')
              .start().addClass('inline-block')
                .start()
                  .addClass('bold-label')
                  .add(this.DUE_DATE_LABEL)
                .end()
                .start().add(this.dueDate$).end()
              .end()
              .start().addClass(this.myClass('issue-date-block'))
                .start()
                  .addClass('bold-label')
                  .add(this.ISSUE_DATE_LABEL)
                .end()
                .start().add(this.issueDate$).end()
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
            .add(this.slot(function(invoice$invoiceFile) {
              return self.E().forEach(invoice$invoiceFile, function(file) {
                this
                  .start().addClass(self.myClass('attachment'))
                    .add(file.filename)
                    .on('click', () => {
                      window.open(file.address);
                    })
                  .end();
              });
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
          .add(this.invoice$.dot('note'))
        .end()

        .start()
          .addClass('print-wrapper')
          .start()
            .addClass('inline-block')
            .addClass('sme').addClass('link-button')
            .start('img')
              .addClass('icon')
              .addClass(this.myClass('align-top'))
              .attr('src', this.PRINT_ICON)
            .end()
            .start('img')
              .addClass('icon').addClass('hover')
              .addClass(this.myClass('align-top'))
              .attr('src', this.PRINT_ICON_HOVER)
              .on('click', () => window.print())
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
  ],
});
