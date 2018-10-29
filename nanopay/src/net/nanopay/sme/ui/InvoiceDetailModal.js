foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'InvoiceDetailModal',
  extends: 'foam.u2.View',

  docuemntation: ``,

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
      name: 'payee',
      factory: function() {
        if ( this.invoice.payee ) {
          this.payeeIsSet = true;
          return this.invoice.payee;
        } else {
          this.payeeIsSet = false;
          return net.nanopay.auth.PublicUserInfo.create();
        }
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.PublicUserInfo',
      name: 'payer',
      factory: function() {
        if ( this.invoice.payer ) {
          this.payerIsSet = true;
          return this.invoice.payer;
        } else {
          this.payerIsSet = false;
          return net.nanopay.auth.PublicUserInfo.create();
        }
      }
    },
    {
      class: 'Boolean',
      name: 'payerIsSet'
    },
    {
      class: 'Boolean',
      name: 'payeeIsSet'
    }
  ],

  methods: [
    function initE() {
      var self = this;

      if ( ! this.payerIsSet && this.invoice.payerId ) {
        this.getAccountInfo(this.invoice.payerId).then((user) => {
          this.payer = user;
        });
      }

      if ( ! this.payeeIsSet && this.invoice.payeeId ) {
        this.payee = this.getAccountInfo(this.invoice.payeeId).then((user) => {
          this.payee = user;
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
          .add('Invoice #' + this.invoice.invoiceNumber)
        .end()
        .start()
          .style({ 'float': 'right', 'margin-right': '10px' })
          .addClass('generic-status')
          .addClass('Invoice-Status-' + this.invoice.status.label)
          .add(this.invoice.status.label)
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
          .start().add(this.dot('payer').dot('businessName')).end()
          .start().add(this.dot('payer').dot('businessAddress').map((value) => {
            return this.formatStreetAddress(value);
          })).end()
          .start().add(this.dot('payer').dot('businessAddress').map((value) => {
            return this.formatRegionAddress(value);
          })).end()
          .start().add(this.dot('payer').dot('businessAddress').dot('postalCode')).end()
          .start().add(this.dot('payer').dot('businessPhone').dot('number')).end()
          .start().add(this.dot('payer').dot('email')).end()
        .end()
        .start().addClass('invoice-text-left')
          .start().addClass('invoice-text-label').add('Payment to').end()
          .start().add(this.dot('payee').map((p) => {
            return p ? p.firstName + ' ' + p.lastName : '';
          })).end()
          .start().add(this.dot('payee').dot('businessPhone').dot('number')).end()
          .start().add(this.dot('payee').dot('email')).end()
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
