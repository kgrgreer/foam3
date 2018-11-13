foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'NewInvoiceForm',
  extends: 'foam.u2.View',

  documentation: `This view has the reuseable form to create new invoice
                 or update the existing invoice`,

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'notificationDAO',
    'publicUserDAO',
    'stack',
    'user'
  ],

  exports: [
    'uploadFileData'
  ],

  requires: [
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.auth.PublicUserInfo',
  ],

  css: `
    ^ .invoice-block {
      display: inline-block;
      width: 45%;
    }
    ^ .invoice-block-right {
      display: inline-block;
      width: 45%;
      float: right;
    }
    ^ .title {
      margin-top: 15px !important;
    }
    ^ .labels {
      font-size: 14px;
      color: #093649;
    }
    ^ .customer-div {
      vertical-align: top;
      width: 100%;
      display: inline-block;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
      height: 40px;
      margin-top: 10px;
    }
    ^ .upload-file {
      margin-top: 30px;
      border: 4px;
      height: 200px;
      width: 500px;
    }
    ^ .invoice-input-box {
      font-size: 12px;
      width: 100%;
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      border-radius: 0 4px 4px 0;
      outline: none;
      padding-left: 5px;
      padding-right: 5px;
    }
    ^ .invoice-amount-input {
      width: calc(100% - 101px);
      display: inline-block;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice {
      width: 95px;
      padding-left: 5px;
      background-color: white;
      display: inline-block;
      height: 38px;
      vertical-align: top;
      border-style: solid;
      border-width: 1px 0 1px 1px;
      border-color: rgba(164, 179, 184, 0.5);
      border-radius: 4px 0 0 4px;
    }
  `,

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoice'
    },
    'type',
    {
      name: 'currencyType',
      view: {
              class: 'net.nanopay.sme.ui.CurrencyChoice',
              isNorthAmerica: true
            },
      value: 'CAD'
    },
    'uploadFileData'
  ],

  methods: [
    function initE() {
      var contactLabel = this.type === 'payable' ? 'Send to' : 'Request from';
      var addNote = `Add note to this ${this.type}`;

      // Setup the default destination currency
      this.invoice.destinationCurrency = this.currencyType;

      if ( this.type === 'payable' ) {
        this.invoice.payerId = this.user.id;
      } else {
        this.invoice.payeeId = this.user.id;
      }

      this.addClass(this.myClass()).start().style({ 'width': '500px' })
        .start().addClass('customer-div')
          .start().addClass('labels').add(contactLabel).end()
          .startContext({ data: this.invoice })
            .tag(this.type === 'payable' ? this.invoice.PAYEE_ID : this.invoice.PAYER_ID)
          .endContext()
        .end()

        .start().addClass('labels').add('Amount').end()
        .startContext({ data: this.invoice })
          .startContext({ data: this })
            .start(this.CURRENCY_TYPE)
              .on('click', () => {
                this.invoice.destinationCurrency = this.currencyType;
              })
            .end()
          .endContext()
          .start().addClass('invoice-amount-input')
            .start(this.Invoice.AMOUNT)
              .addClass('invoice-input-box')
            .end()
          .end()

          .start().addClass('invoice-block')
            .start().addClass('labels').add('Invoice #').end()
            .start(this.Invoice.INVOICE_NUMBER)
              .addClass('invoice-input-box')
            .end()

            .start().addClass('labels').add('PO #').end()
            .start(this.Invoice.PURCHASE_ORDER)
              .addClass('invoice-input-box')
            .end()
          .end()

          .start().addClass('invoice-block-right')
            .start().addClass('labels').add('Date issued').end()
            .start(this.Invoice.ISSUE_DATE.clone().copyFrom({
              view: 'foam.u2.DateView'
            })).addClass('invoice-input-box').end()

            .start().addClass('labels').add('Date Due').end()
            .start(this.Invoice.DUE_DATE).addClass('invoice-input-box').end()
          .end()
          .start({ class: 'net.nanopay.sme.ui.UploadFileModal' })
            .addClass('upload-file')
            .on('change', () => {
              this.invoice.invoiceFile = this.uploadFileData;
            })
          .end()
          .br()
          .start().add(addNote).tag( this.Invoice.NOTE, {
              class: 'foam.u2.tag.TextArea',
              rows: 5,
              cols: 80
            })
          .end()
        .endContext()
      .end();
    }
  ]
});
