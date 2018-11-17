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
    'canReceiveCurrencyDAO',
    'ctrl',
    'errors',
    'notificationDAO',
    'publicUserDAO',
    'stack',
    'user'
  ],

  exports: [
    'uploadFileData'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.invoice.model.Invoice'
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
    ^ .validation-failure-container {
      font-size: 10px;
      color: #d0021b;
      margin: 4px 0 16px 0;
    }
    ^ .foam-u2-DateView {
      border: solid 1px #8e9090 !important;
      border-radius: 3px !important;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice .popUpDropDown::before {
      transform: translate(63px, -28px);
    }
    ^ .foam-u2-tag-TextArea {
      border-radius: 3px !important;
      border: solid 1px #8e9090 !important;
      padding: 12px;
      width: 500px;
    }
  `,

  messages: [
    {
      name: 'PAYABLE_ERROR_MSG',
      message: 'The selected contact cannot receive payment in the selected currency.'
    },
    {
      name: 'RECEIVABLE_ERROR_MSG',
      message: 'You do not have a verified bank account in that currency.'
    }
  ],

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
      value: {
        alphabeticCode: 'CAD'
      }
    },
    'uploadFileData',
    {
      class: 'Boolean',
      name: 'isInvalid',
      documentation: `
        True if the form is in an invalid state with respect to sending USD to
        a contact without a verified US bank account.
      `,
      postSet: function(oldValue, newValue) {
        this.errors = newValue;
      }
    }
  ],

  methods: [
    function initE() {
      var contactLabel = this.type === 'payable' ? 'Send to' : 'Request from';
      var addNote = `Note`;

      // Setup the default destination currency
      this.invoice.destinationCurrency
          = this.currencyType.alphabeticCode;

      if ( this.type === 'payable' ) {
        this.invoice.payerId = this.user.id;
      } else {
        this.invoice.payeeId = this.user.id;
      }

      this.addClass(this.myClass()).start().style({ 'width': '500px' })
        .start().addClass('input-wrapper')
          .start().addClass('input-label').add(contactLabel).end()
          .startContext({ data: this.invoice })
            .tag(this.type === 'payable' ? this.invoice.PAYEE_ID : this.invoice.PAYER_ID)
          .endContext()
          .start()
            .show(this.isInvalid$)
            .addClass(this.myClass('validation-failure-container'))
            .add(this.type === 'payable' ?
              this.PAYABLE_ERROR_MSG :
              this.RECEIVABLE_ERROR_MSG)
          .end()
        .end()
        .startContext({ data: this.invoice })
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add('Amount').end()
              .startContext({ data: this })
                .start(this.CURRENCY_TYPE)
                  .on('click', () => {
                    this.invoice.destinationCurrency
                        = this.currencyType.alphabeticCode;
                  })
                .end()
              .endContext()
                .start().addClass('invoice-amount-input')
                  .start(this.Invoice.AMOUNT)
                    .addClass('invoice-input-box')
                  .end()
                .end()
            .end()

            .start().addClass('invoice-block')
              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('Invoice #').end()
                .start(this.Invoice.INVOICE_NUMBER)
                  .addClass('input-field')
                .end()
              .end()
              
              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('PO #').end()
                .start(this.Invoice.PURCHASE_ORDER)
                  .addClass('input-field')
                .end()
              .end()
            .end()

            .start().addClass('invoice-block-right')
              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('Date issued').end()
                .start(this.Invoice.ISSUE_DATE.clone().copyFrom({
                  view: 'foam.u2.DateView'
                })).addClass('input-field').end()
              .end()
              
              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('Date Due').end()
                .start(this.Invoice.DUE_DATE).addClass('input-field').end()
              .end()
            .end()
            .start({ class: 'net.nanopay.sme.ui.UploadFileModal' })
              .addClass('upload-file')
              .on('change', () => {
                this.invoice.invoiceFile = this.uploadFileData;
              })
            .end()
            .br()
            .start().addClass('input-wrapper')
              .start().addClass('input-label').add(addNote).end()
              .tag( this.Invoice.NOTE, {
                class: 'foam.u2.tag.TextArea',
                rows: 5,
                cols: 80
              })
            .end()
          .end()
        .endContext()
        .add(this.slot(function(currencyType) {
          var currency = currencyType.alphabeticCode;
          var isPayable = this.type === 'payable';
          var partyId = isPayable ? this.invoice.payeeId : this.user.id;
          if ( currency !== 'CAD' && partyId ) {
            var request = this.CanReceiveCurrency.create({
              userId: partyId,
              currencyId: currency
            });
            this.canReceiveCurrencyDAO.put(request).then(({ response }) => {
              this.isInvalid = ! response;
            });
          } else {
            this.isInvalid = false;
          }
        }))
      .end();
    }
  ]
});
