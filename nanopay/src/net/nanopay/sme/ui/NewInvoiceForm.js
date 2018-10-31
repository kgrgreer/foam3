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
      border-radius: 4px;
      outline: none;
    }
    ^ .invoice-amount-input {
      width: 415px;
      display: inline-block;
    }
    ^ .net-nanopay-tx-ui-CurrencyChoice {
      width: 85px;
      border-right: 1px solid lightgrey;
      background-color: white;
      display: inline-block;
      height: 36px;
      vertical-align: top;
      margin-top: 1px;
      margin-bottom: 1px;
      border-top-width: 1px;
      padding-bottom: 1px;
      border-right-width: 0px;
    }
    ^ .foam-u2-PopupView {
      width: 0px;
      padding: 0px;
      left: 0px !important;
      top: 40px;
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
      name: 'userList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.publicUserDAO.where(X.data.NEQ(X.data.PublicUserInfo.ID, X.user.id)),
          placeholder: `Choose from contacts`,
          objToChoice: function(user) {
            var username = user.businessName || user.organization ||
                user.label();
            return [user.id, username + ' - (' + user.email + ')'];
          }
        });
      },
      factory: function() {
        return this.type === 'payable' ?
            this.invoice.payeeId : this.invoice.payerId;
      }
    },
    {
      name: 'currencyType',
      view: 'net.nanopay.tx.ui.CurrencyChoice',
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

      this.addClass(this.myClass()).start().style({ 'width': '500px' })
        .start().addClass('customer-div')
          .start().addClass('labels').add(contactLabel).end()
          .startContext({ data: this })
            .start(this.USER_LIST)
              .on('change', () => {
                this.invoice.payerId = this.type === 'payable' ? this.user.id : this.userList;
                this.invoice.payeeId = this.type === 'payable' ? this.userList : this.user.id;
              })
            .end()
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
            .start(this.Invoice.ISSUE_DATE).addClass('invoice-input-box').end()

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
          .start('a').add(addNote).on('click', () => {
            console.log('Clicked');
          }).end()
        .endContext()
      .end();
    }
  ]
});
