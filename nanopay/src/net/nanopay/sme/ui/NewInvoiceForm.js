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
    'invoice',
    'notificationDAO',
    'notify',
    'stack',
    'user',
    'userDAO'
  ],

  exports: [
    'as view',
    'uploadFileData'
  ],

  requires: [
    'foam.nanos.auth.User',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice',
    'foam.u2.dialog.Popup',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
  ],

  css: `
    ^ .invoice-block {
      display: inline-block;
    }
    ^ .invoice-block-right {
      display: inline-block;
      float: right;
    }
    ^ .title {
      margin-top: 15px !important;
    }
    ^ .labels {
      font-size: 14px;
      color: /*%BLACK%*/ #1e1f21;
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
    ^ .invoice-input-box {
      font-size: 12px;
      width: 100%;
      height: 40px;
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
      background: #ffffff;
      display: inline-block;
      height: 38px;
      vertical-align: top;
      border-style: solid;
      border-width: 1px 0 1px 1px;
      border-color: /*%GREY3%*/ #cbcfd4;
      border-radius: 4px 0 0 4px;
    }
    ^ .validation-failure-container {
      font-size: 10px;
      color: #d0021b;
      margin: 4px 0 16px 0;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice .popUpDropDown::before {
      transform: translate(63px, -28px);
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice .popUpDropDown {
      padding: 0px;
    }
    ^ .foam-u2-tag-TextArea {
      width: 100%;
    }
    ^ .foam-u2-ActionView-currencyChoice {
      margin-left: 0px !important;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice img {
      width: 20px;
    }
    ^ .foam-u2-ActionView-CurrencyChoice > span {
      font-size: 10px !important;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice-carrot {
      position: relative;
      right: 0;
      top: -4px;
    }
    ^ .foam-u2-view-RichChoiceView-container {
      z-index: 10;
    }
    ^ .foam-u2-view-RichChoiceView-action {
      height: 36px;
      padding: 8px 13px;
    }
    ^ .net-nanopay-sme-ui-fileDropZone-FileDropZone {
      background-color: #ffffff;
      margin-top: 16px;
      min-height: 264px;
    }
    ^ .small-error-icon {
      height: 10px;
      margin-top: 2px;
      margin-right: 2px;
    }
    ^ .add-banking-information {
      color: #6a39ff;
      cursor: pointer;
      float: right;
      margin-left: 30px;
      text-decoration: underline;
    }
    ^ .foam-u2-view-RichChoiceView.invalid .foam-u2-view-RichChoiceView-selection-view, 
    ^ .error-box {
      border-color: #f91c1c;
      background: #fff6f6;
    }
    ^ .error-box-outline {
      border-color: #f91c1c;
    }
    ^ .disabled {
      pointer-events: none;
      filter: grayscale(100%) opacity(60%);
    }
    ^tooltip {
      display: none;
      padding: 10px;
      padding-bottom: 30px;
      position: absolute;
      width: 320px;
      height: 75px;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      border: solid 1px #e2e2e3;
      background-color: #ffffff;
      z-index: 1000;
    }
    ^showTooltip {
      display: block;
    }
    ^no-access-icon {
      margin-top: 13px;
      float: left;
      height: 100%;
      margin-right: 10px;
    }
    ^ .date-input-field .date-display-box {
      width: 99%;
      font-size: 14px !important;
      height: 40px !important;
      border: solid 1px #8e9090 !important;
      background: #fff !important;
      border-radius: 3px !important;
      font-weight: 400 !important;
      box-shadow: none !important;
      padding-top: 2px;
    }
    ^ .date-input-field .date-display-text {
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-DateView {
      width: 100%;
    }
  `,

  messages: [
    {
      name: 'PAYABLE_ERROR_MSG',
      message: 'Banking information for this contact must be provided'
    },
    {
      name: 'RECEIVABLE_ERROR_MSG',
      message: 'You do not have the ability to exchange funds in that currency with this contact.'
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
      message: 'Add a note to this'
    },
    {
      name: 'ADD_NOTE',
      message: 'Note'
    },
    {
      name: 'ADD_BANK',
      message: 'Add Banking Information'
    },
    {
      name: 'UNSUPPORTED_CURRENCY1',
      message: `Sorry, we don't support `
    },
    {
      name: 'UNSUPPORTED_CURRENCY2',
      message: ' for this contact'
    },
    {
      name: 'TOOLTIP_TITLE',
      message: `This field can't be edited.`
    },
    {
      name: 'TOOLTIP_BODY',
      message: 'Please edit this invoice in your accounting software and sync again.'
    }
  ],

  constants: [
    {
      name: 'TOOLTIP_OFFSET',
      value: 5
    }
  ],

  properties: [
    'type',
    {
      name: 'currencyType',
      view: { class: 'net.nanopay.sme.ui.CurrencyChoice' },
      expression: function(invoice) {
        return invoice.destinationCurrency ? invoice.destinationCurrency : 'CAD';
      }
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'uploadFileData',
      factory: function() {
        return this.invoice.invoiceFile ? this.invoice.invoiceFile : [];
      },
      postSet: function(_, n) {
        this.invoice.invoiceFile = n;
      }
    },
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
    },
    {
      class: 'String',
      name: 'notePlaceHolder',
      factory: function() {
        return this.type === 'payable' ? 'payment' : 'request';
      }
    },
    {
      class: 'String',
      name: 'contactLabel',
      factory: function() {
        return this.type === 'payable' ? 'Send to' : 'Request from';
      }
    },
    {
      class: 'String',
      name: 'selectedCurrency'
    },
    {
      class: 'Boolean',
      name: 'showAddBank',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showTooltip',
      value: false
    },
     {
      class: 'Boolean',
      name: 'disableAccountingInvoiceFields',
      value: false,
      documentation: `
        Users should not be able to edit invoice pulled from accounting software
        on Ablii, as this will cause mismatches between the data on Ablii and
        the data on the accounting software.
      `,
      expression: function(invoice, type) {
        return (
          this.XeroInvoice.isInstance(invoice) ||
          this.QuickbooksInvoice.isInstance(invoice)
        ) && type !== 'payable';
      }
    },
    {
      type: 'Int',
      name: 'xPosition',
      value: 0
    },
     {
      type: 'Int',
      name: 'yPosition',
      value: 0
    }
  ],

  methods: [
    function initE() {
      var self = this;
      // Setup the default destination currency
      this.invoice.destinationCurrency
        = this.currencyType;
      if ( this.type === 'payable' ) {
        this.invoice.payerId = this.user.id;
      } else {
        this.invoice.payeeId = this.user.id;
      }
      let displayMode = this.disableAccountingInvoiceFields ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;

      // Listeners to check if receiver or payer is valid for transaction.
      this.invoice$.dot('contactId').sub(this.onContactIdChange);

      this.currencyType$.sub(this.onCurrencyTypeChange);

      this.ctrl
        .start()
          .addClass(this.myClass('tooltip'))
          .style({ top: this.yPosition$, left: this.xPosition$ })
          .enableClass(this.myClass('showTooltip'), this.showTooltip$)
          .start().addClass(this.myClass('no-access-icon'))
            .start('img').attrs({ src: 'images/no-access.svg' }).end()
          .end()
          .start('h3').add(this.TOOLTIP_TITLE).end()
          .start('p').add(this.TOOLTIP_BODY).end()
        .end();

      this.addClass(this.myClass()).start()
        .start().addClass('input-wrapper')
          .start()
            .addClass('input-label')
            .add(this.contactLabel)
          .end()
          .start()
            .on('mouseenter', this.toggleTooltip)
            .on('mouseleave', this.toggleTooltip)
            .on('mousemove', this.setCoordinates)
            .startContext({ data: this.invoice })
              .start(this.invoice.CONTACT_ID, {
                action: this.ADD_CONTACT,
                search: true,
                searchPlaceholder: 'Start typing company name to search',
                mode: displayMode
              })
                .enableClass('invalid', this.slot(
                  function(isInvalid, type, showAddBank) {
                    return isInvalid && type === 'payable' && showAddBank;
                  }))
              .end()
            .endContext()
          .end()
          .start()
            .show(this.isInvalid$)
            .addClass('validation-failure-container')
            .start().show(this.showAddBank$)
              .start('img').addClass('small-error-icon').attrs({ src: 'images/inline-error-icon.svg' }).end()
              .add(this.PAYABLE_ERROR_MSG)
              .start().add(this.ADD_BANK).addClass('add-banking-information')
                .on('click', async function() {
                  self.userDAO.find(self.invoice.contactId).then((contact)=>{
                    self.add(self.Popup.create({ onClose: self.checkUser.bind(self) }).tag({
                      class: 'net.nanopay.contacts.ui.modal.ContactWizardModal',
                      data: contact
                    }));
                  });
                })
              .end()
            .end()
            .start().show(! (this.type === 'payable'))
              .add(this.RECEIVABLE_ERROR_MSG)
            .end()
          .end()
        .end()
        .startContext({ data: this.invoice })
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add('Amount').end()
              .start()
                .on('mouseenter', this.toggleTooltip)
                .on('mouseleave', this.toggleTooltip)
                .on('mousemove', this.setCoordinates)
                .startContext({ data: this })
                  .start(this.CURRENCY_TYPE, { mode: displayMode })
                    .enableClass('disabled', this.disableAccountingInvoiceFields$)
                    .enableClass('error-box-outline', this.slot( function(isInvalid, type, showAddBank) {
                        return isInvalid && type === 'payable' && ! showAddBank;
                      }))
                    .on('click', () => {
                      this.invoice.destinationCurrency = this.currencyType.alphabeticCode;
                    })
                  .end()
                .endContext()
                .start().addClass('invoice-amount-input')
                  .start(this.Invoice.AMOUNT, { mode: displayMode })
                    .enableClass('error-box', this.slot( function(isInvalid, type, showAddBank) {
                      return isInvalid && type === 'payable' && ! showAddBank;
                    }))
                    .enableClass('disabled', this.disableAccountingInvoiceFields$)
                    .addClass('invoice-input-box')
                  .end()
                .end()
              .end()
              .start().show(this.slot(
                function(isInvalid, showAddBank) {
                  return isInvalid && ! showAddBank;
                }))
                .start().show(this.type === 'payable').addClass('validation-failure-container')
                  .start('img')
                    .addClass('small-error-icon')
                    .attrs({ src: 'images/inline-error-icon.svg' })
                  .end()
                  .add(this.UNSUPPORTED_CURRENCY1)
                  .add(this.selectedCurrency$)
                  .add(this.UNSUPPORTED_CURRENCY2)
                .end()
              .end()
            .end()

            .start().addClass('invoice-block')
              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('Invoice Number').end()
                .start()
                  .on('mouseenter', this.toggleTooltip)
                  .on('mouseleave', this.toggleTooltip)
                  .on('mousemove', this.setCoordinates)
                  .start(this.Invoice.INVOICE_NUMBER, { mode: displayMode })
                    .enableClass('disabled', this.disableAccountingInvoiceFields$)
                    .attrs({ placeholder: this.INVOICE_NUMBER_PLACEHOLDER })
                  .end()
                .end()
              .end()

              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('Date issued').end()
                .start()
                  .on('mouseenter', this.toggleTooltip)
                  .on('mouseleave', this.toggleTooltip)
                  .on('mousemove', this.setCoordinates)
                  .start(this.Invoice.ISSUE_DATE, { view: 'foam.u2.view.date.DateTimePicker',  mode: displayMode, showTimeOfDay: false })
                    .enableClass('disabled', this.disableAccountingInvoiceFields$)
                    .addClass('date-input-field')
                  .end()
                .end()
              .end()
            .end()

            .start().addClass('invoice-block-right')
              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('P.O. Number').end()
                .start(this.Invoice.PURCHASE_ORDER)
                  .attrs({ placeholder: this.PO_PLACEHOLDER })
                .end()
              .end()

              .start().addClass('input-wrapper')
                .start().addClass('input-label').add('Date Due').end()
                .start()
                  .on('mouseenter', this.toggleTooltip)
                  .on('mouseleave', this.toggleTooltip)
                  .on('mousemove', this.setCoordinates)
                  .start(this.Invoice.DUE_DATE, { mode: displayMode })
                    .enableClass('disabled', this.disableAccountingInvoiceFields$)
                    .addClass('date-input-field')
                  .end()
                .end()
              .end()
            .end()
            .start({
              class: 'net.nanopay.sme.ui.fileDropZone.FileDropZone',
              files$: this.uploadFileData$,
              supportedFormats: {
                'image/jpg': 'JPG',
                'image/jpeg': 'JPEG',
                'image/png': 'PNG',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
                'application/msword': 'DOC',
                'application/pdf': 'PDF'
              }
            }).end()
            .start().addClass('input-wrapper')
              .start().addClass('input-label').add(this.ADD_NOTE).end()
              .start( this.Invoice.NOTE, {
                class: 'foam.u2.tag.TextArea',
                rows: 5,
                cols: 80
              })
              .attrs({
                placeholder: `${this.NOTE_PLACEHOLDER} ${this.notePlaceHolder}`
              }).end()
            .end()
          .end()
        .endContext()
      .end();
    },

    function checkBankAccount() {
      var self = this;
      this.userDAO.find(this.invoice.contactId).then(function(contact) {
        if ( contact && contact.businessId ) {
          self.showAddBank = false;
        } else if ( contact && contact.bankAccount ) {
          self.showAddBank = false;
        } else {
          self.showAddBank = self.type === 'payable';
        }
      });
    }
  ],

  listeners: [
    function onContactIdChange() {
      this.checkUser(this.invoice.destinationCurrency);
    },
    function onCurrencyTypeChange() {
      this.selectedCurrency = this.currencyType.alphabeticCode;
      this.checkUser(this.currencyType.alphabeticCode);
    },
    function checkUser(currency) {
      var destinationCurrency = currency ? currency : 'CAD';
      var isPayable = this.type === 'payable';
      var partyId = isPayable ? this.invoice.contactId : this.user.id;
      if ( partyId && destinationCurrency ) {
        var request = this.CanReceiveCurrency.create({
          userId: partyId,
          payerId: isPayable ? this.user.id : this.invoice.contactId,
          currencyId: destinationCurrency
        });
        this.canReceiveCurrencyDAO.put(request).then((responseObj) => {
          this.isInvalid = ! responseObj.response;
        });
      }
      this.checkBankAccount();
    },
    function toggleTooltip() {
      if ( this.disableAccountingInvoiceFields ) {
        this.showTooltip = ! this.showTooltip;
      }
    },
    function setCoordinates(e) {
      this.xPosition = e.x + this.TOOLTIP_OFFSET;
      this.yPosition = e.y + this.TOOLTIP_OFFSET;
    }
  ],

  actions: [
    {
      name: 'addContact',
      label: 'Create new contact',
      icon: 'images/plus-no-bg.svg',
      code: function(X, e) {
        X.view.add(X.view.Popup.create().tag({
          class: 'net.nanopay.contacts.ui.modal.ContactWizardModal'
        }));
      }
    }
  ]
});

