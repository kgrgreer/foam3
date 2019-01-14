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
    'errors',
    'invoice',
    'notificationDAO',
    'notify',
    'stack',
    'user',
    'userDAO'
  ],

  exports: [
    'uploadFileData'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.contacts.Contact',
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
      background: rgb(247, 247, 247, 1);
      border: solid 1px rgba(164, 179, 184, 0.5);
      border-radius: 0 4px 4px 0;
      outline: none;
      padding-left: 5px;
      padding-right: 5px;
    }
    ^ .invoice-amount-input {
      width: calc(100% - 86px);
      display: inline-block;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice {
      width: 80px;
      padding-left: 5px;
      background: rgb(247, 247, 247, 1);
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
      background: rgb(247, 247, 247, 1);
    }
    ^ .net-nanopay-ui-ActionView-currencyChoice {
      margin-left: 0px !important;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice img {
      width: 20px;
    }
    ^ .net-nanopay-ui-ActionView-CurrencyChoice > span {
      font-size: 10px !important;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice-carrot {
      position: relative;
      right: 12px;
      top: -4px;
    }
    ^ .foam-u2-view-RichChoiceView-container {
      z-index: 10;
    }
    ^ .foam-u2-view-RichChoiceView-selection-view {
      background: rgb(247, 247, 247, 1);
    }
    ^ .box-for-drag-drop {
      background: rgb(247, 247, 247, 1) !important;
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
    },
    {
      name: 'INVOICE_NUMBER_PLACEHOLDER',
      message: 'Enter an invoice number'
    },
    {
      name: 'PO_PLACEHOLDER',
      message: 'Optional'
    },
    {
      name: 'NOTE_PLACEHOLDER',
      message: 'Add a note to this request'
    }
  ],

  properties: [
    'type',
    {
      name: 'currencyType',
      view: {
        class: 'net.nanopay.sme.ui.CurrencyChoice',
        isNorthAmerica: true
      },
      expression: function(invoice) {
        return invoice.destinationCurrency ? { alphabeticCode: invoice.destinationCurrency } : { alphabeticCode: 'CAD' };
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

      // Listeners to check if receiver or payer is valid for transaction.
      this.invoice$.dot('contactId').sub(this.checkUser);

      this.currencyType$.sub(this.checkUser);

      var partyId = this.type === 'payable' ?
        this.invoice.payeeId :
        this.invoice.payerId;

      var dao = partyId
        ? this.userDAO.where(
            this.OR(
              this.AND(
                // TODO: Also use this.INSTANCE_OF(this.Contact) when
                // marshalling is fixed for INSTANCE_OF.
                this.EQ(this.Contact.OWNER, this.user.id),
                this.NEQ(this.Contact.BUSINESS_ID, partyId)
              ),
              this.EQ(this.User.ID, partyId)
            )
          )
        : this.user.contacts;

      var partyIdPropertyInfo = (
        this.type === 'payable'
          ? this.invoice.PAYEE_ID
          : this.invoice.PAYER_ID
      ).clone().copyFrom({
        view: {
          class: 'foam.u2.view.RichChoiceView',
          selectionView: { class: 'net.nanopay.auth.ui.UserSelectionView' },
          rowView: { class: 'net.nanopay.auth.ui.UserCitationView' },
          sections: [
            {
              heading: 'Contacts',
              dao: dao.orderBy(this.User.BUSINESS_NAME)
            }
          ]
        }
      });

      this.addClass(this.myClass()).start()
        .start().addClass('input-wrapper')
          .start().addClass('input-label').add(contactLabel).end()
          .startContext({ data: this.invoice })
            .tag(this.invoice.CONTACT_ID)
          .endContext()
          .start()
            .show(this.isInvalid$)
            .addClass('validation-failure-container')
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
                .start(this.Invoice.INVOICE_NUMBER).attrs({ placeholder: this.INVOICE_NUMBER_PLACEHOLDER })
                  .addClass('input-field')
                .end()
              .end()

              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('PO #').end()
                .start(this.Invoice.PURCHASE_ORDER).attrs({ placeholder: this.PO_PLACEHOLDER })
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
              .on('drop', () => {
                this.invoice.invoiceFile = this.uploadFileData;
              })
            .end()
            .br()
            .start().addClass('input-wrapper')
              .start().addClass('input-label').add(addNote).end()
              .start( this.Invoice.NOTE, {
                class: 'foam.u2.tag.TextArea',
                rows: 5,
                cols: 80
              }).attrs({ placeholder: this.NOTE_PLACEHOLDER }).end()
            .end()
          .end()
        .endContext()
      .end();
    }
  ],

  listeners: [
    function checkUser() {
      var currency = this.invoice.destinationCurrency ? this.invoice.destinationCurrency : this.currencyType.alphabeticCode;
      var isPayable = this.type === 'payable';
      var partyId = isPayable ? this.invoice.contactId : this.user.id;

      if ( partyId && currency ) {
        var request = this.CanReceiveCurrency.create({
          userId: partyId,
          currencyId: currency
        });
        this.canReceiveCurrencyDAO.put(request).then((responseObj) => {
          this.isInvalid = ! responseObj.response;
          if ( this.isInvalid && this.type === 'payable' ) {
            this.notify(responseObj.message, 'error');
          }
        });
      }
    }
  ]
});
