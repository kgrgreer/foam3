/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'payeeCurrencyService',
    'auth',
    'canReceiveCurrencyDAO',
    'getDefaultCurrencyDAO',
    'currencyDAO',
    'ctrl',
    'errors',
    'invoice',
    'pushMenu',
    'notificationDAO',
    'notify',
    'stack',
    'subject',
    'userDAO'
  ],

  exports: [
    'as view',
    'uploadFileData'
  ],

  requires: [
    'foam.core.Currency',
    'foam.nanos.auth.User',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.bank.GetDefaultCurrency',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.ui.wizard.ContactWizardDetailView',
    'foam.u2.dialog.Popup',
    'net.nanopay.accounting.xero.model.XeroInvoice',
    'net.nanopay.accounting.quickbooks.model.QuickbooksInvoice',
  ],

  css: `
    ^ .invoice-block {
      display: inline-block;
      max-width: 240px;
    }
    ^ .invoice-block-right {
      display: inline-block;
      float: right;
      max-width: 240px;
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
    }
    ^ .invoice-input-box {
      font-size: 12px;
      width: 100%;
      height: 40px;
      border-radius: 0 4px 4px 0;
      outline: none;
    }
    ^ .invoice-amount-input {
      width: calc(100% - 90px);
      display: inline-block;
    }
    ^ .net-nanopay-sme-ui-CurrencyChoice {
      width: 80px;
      padding-left: 5px;
      background: #ffffff;
      display: inline-block;
      height: 38px;
      vertical-align: top;
      border: 1px solid /*%GREY3%*/ #cbcfd4;
      border-radius: 3px;
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
    ^ .foam-u2-CurrencyView {
      width: 100%;
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
      background-color: #ffffff;
    }
    ^ .foam-u2-MultiView {
      width: 100%;
      margin-top: 16px;
      min-height: 264px;
    }
    ^ .foam-nanos-fs-fileDropZone-FileDropZone {
      background-color: #ffffff;
    }
    ^ .foam-nanos-fs-fileDropZone-FilePreview {
      max-width: 150px;
      max-height: 264px;
      margin-right: -30px;
    }
    ^ .foam-nanos-fs-fileDropZone-FilePreview iframe {
      width: 228px;
      max-height: 264px;
    }
    ^ .foam-nanos-fs-fileDropZone-FilePreview img {
      width: 228px;
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
      height: 44px;
    }
    ^ .foam-u2-TextField {
      max-width: 240px;
    }
    ^ .input-wrapper-width {
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
      message: 'You do not have the ability to receive funds in this currency'
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
      message: 'Notes'
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
      message: `This field can't be edited`
    },
    {
      name: 'TOOLTIP_BODY',
      message: 'Please edit this invoice in your accounting software and sync again'
    },
    {
      name: 'EXTERNAL_USER_MESSAGE',
      message: `The contact you’ve selected needs to sign up to the platform in order to pay you.
          The contact will receive an email notification only. If the contact chooses to pay
          you in another way, you can mark the invoice as complete.`
    },
    {
      name: 'EXTERNAL_TITLE',
      message: 'Attention to Payment'
    },
    { name: 'ACCOUNT_WITHDRAW_LABEL', message: 'Withdraw from' },
    { name: 'ACCOUNT_DEPOSIT_LABEL', message: 'Deposit to' },

    { name: 'SEND_TO', message: 'Send to' },
    { name: 'REQUEST_FROM', message: 'Request from' },
    { name: 'AMOUNT', message: 'Amount' },
    { name: 'INVOICE_NUMBER', message: 'Invoice number' },

    { name: 'DATE_ISSUED', message: 'Issue date' },
    { name: 'PO_NUMBER', message: 'Purchase order number' },
    { name: 'DATE_DUE', message: 'Due date' },

    { name: 'PAYMENT', message: 'payment' },
    { name: 'REQUEST', message: 'request' },
    { name: 'START_SEARCH', message: 'Start typing company name to search' }
  ],

  constants: [
    {
      name: 'TOOLTIP_OFFSET',
      value: 5
    }
  ],

  properties: [
    'type',
    'contact',
    {
      class: 'String',
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
      },
      view: function(_, X) {
        let selectSlot = foam.core.SimpleSlot.create({value: 0});
        return foam.u2.MultiView.create({
        views: [
          foam.nanos.fs.fileDropZone.FileDropZone.create({
            files$: X.uploadFileData$,
            selected$: selectSlot
          }, X),
          foam.nanos.fs.fileDropZone.FilePreview.create({
            data$: X.uploadFileData$,
            selected$: selectSlot
          }, X)
        ]
        });
      },
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
        return this.type === 'payable' ? this.PAYMENT : this.REQUEST;
      }
    },
    {
      class: 'String',
      name: 'contactLabel',
      factory: function() {
        return this.type === 'payable' ? this.SEND_TO : this.REQUEST_FROM;
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
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredCurrencyDAO',
      factory: function() {
        return this.currencyDAO;
      }
    },
    {
      class: 'Array',
      name: 'currencies'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.bank.BankAccount',
      name: 'chosenBankAccount'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.contacts.Contact',
      name: 'addedContact',
      factory: function() {
        return net.nanopay.contacts.Contact.create({}, this.ctrl);
      }
    },
  ],

  methods: [
    async function init() {
      this.onContactIdChange();
      if ( this.type != 'payable' ) {
        await this.subject.user.accounts.where(this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED))
          .select({
            put: (b) => {
              this.currencies.push(b.denomination);
            }
          });
        this.currencyType = this.currencies[0];
        this.filteredCurrencyDAO = this.currencyDAO.where(this.IN(this.Currency.ID, this.currencies));
      } else {
        let currencies = await this.payeeCurrencyService.query(null, null);
        this.filteredCurrencyDAO = this.currencyDAO.where(this.IN(this.Currency.ID, currencies));
      }
    },
    function initE() {
      var self = this;
      // Setup the default destination currency
      this.invoice.destinationCurrency
        = this.currencyType;
      if ( this.type === 'payable' ) {
        this.invoice.payerId = this.subject.user.id;
      } else {
        this.invoice.payeeId = this.subject.user.id;
      }
      let displayMode = this.disableAccountingInvoiceFields ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;

      // Listeners to check if receiver or payer is valid for transaction.
      this.invoice$.dot('contactId').sub(this.onContactIdChange);
      this.currencyType$.sub(this.onCurrencyTypeChange);

      var accountSelectionView = {
        class: 'foam.u2.view.RichChoiceView',
        selectionView: { class: 'net.nanopay.bank.ui.BankAccountSelectionView' },
        rowView: { class: 'net.nanopay.bank.ui.BankAccountCitationView' },
        sections: [
          {
            heading: 'Your bank accounts',
            dao: this.subject.user.accounts.where(
              this.EQ(this.BankAccount.STATUS, this.BankAccountStatus.VERIFIED)
            )
          }
        ],
        action: this.ACCOUNT_CREATE
      };

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
                actionData: this,
                search: true,
                searchPlaceholder: this.START_SEARCH,
                mode: displayMode
              })
                .enableClass('invalid', this.slot(
                  function(isInvalid, type, showAddBank) {
                    return isInvalid && type === 'payable' && showAddBank;
                  }))
              .end()
              .start({ class: 'net.nanopay.sme.ui.InfoMessageContainer', message: this.EXTERNAL_USER_MESSAGE, title: this.EXTERNAL_TITLE })
              .show(this.slot(function(type, contact) {
                return contact != null ? type != 'payable' && contact.businessId == 0 : false;
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
                    self.add(self.ContactWizardDetailView.create({
                      model: 'net.nanopay.contacts.Contact',
                      data: contact,
                      controllerMode: foam.u2.ControllerMode.CREATE,
                      onClose: self.checkUser.bind(self)
                    }, self))
                  });
                })
              .end()
            .end()
          .end()
        .end()
        .startContext({ data: this.invoice })
          .start().addClass('input-wrapper').addClass('input-wrapper-width')
            .start().addClass('input-label').add(this.AMOUNT).end()
              .start()
                .on('mouseenter', this.toggleTooltip)
                .on('mouseleave', this.toggleTooltip)
                .on('mousemove', this.setCoordinates)
                .startContext({ data: this })
                  .start(this.CURRENCY_TYPE, { mode: displayMode, dao$: this.filteredCurrencyDAO$ })
                    .enableClass('disabled', this.disableAccountingInvoiceFields$)
                    .enableClass('error-box-outline', this.slot( function(isInvalid, type, showAddBank) {
                        return isInvalid && type === 'payable' && ! showAddBank;
                      }))
                    .on('click', () => {
                      this.invoice.destinationCurrency = this.currencyType.id;
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
                .start()
                .addClass('validation-failure-container')
                .show(! (this.type === 'payable'))
                  .add(this.RECEIVABLE_ERROR_MSG)
                .end()
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
            .start()
              .addClass('input-wrapper')
              .start()
                .addClass('input-label')
                .add( this.type === 'payable' ? this.ACCOUNT_WITHDRAW_LABEL : this.ACCOUNT_DEPOSIT_LABEL )
              .end()
              .start()
                  .add(this.slot(function(invoice, type) {
                     if ( type === 'payable' ) {
                      return invoice.ACCOUNT.copyFrom({ view: accountSelectionView });
                     }
                     return invoice.DESTINATION_ACCOUNT.copyFrom({ view: accountSelectionView });
                  }))
              .end()
            .end()
            .start().addClass('invoice-block')
              .start().addClass('input-wrapper')
                .start().addClass('input-label').add(this.INVOICE_NUMBER).end()
                  .on('mouseenter', this.toggleTooltip)
                  .on('mouseleave', this.toggleTooltip)
                  .on('mousemove', this.setCoordinates)
                  .start(this.Invoice.INVOICE_NUMBER, { mode: displayMode }).addClass('input-string')
                    .enableClass('disabled', this.disableAccountingInvoiceFields$)
                    .attrs({ placeholder: this.INVOICE_NUMBER_PLACEHOLDER })
                  .end()
              .end()

              .start().addClass('input-wrapper')
                .start().addClass('input-label').add(this.DATE_ISSUED).end()
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
                .start().addClass('input-label').add(this.PO_NUMBER).end()
                .start(this.Invoice.PURCHASE_ORDER).addClass('input-string')
                  .attrs({ placeholder: this.PO_PLACEHOLDER })
                .end()
              .end()

              .start().addClass('input-wrapper')
                .start().addClass('input-label').add(this.DATE_DUE).end()
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
            .add(this.UPLOAD_FILE_DATA)
            .start().addClass('input-wrapper').style({ display: 'inline-block'})
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
    },
    function setContactIdOnContactAdd() {
      if ( this.addedContact.id ) {
        this.invoice.contactId = this.addedContact.id;
      }
      this.addedContact = undefined;
    }
  ],

  listeners: [
    async function onContactIdChange() {
      this.contact = await this.subject.user.contacts.find(this.invoice.contactId);
      if ( this.contact && ( this.contact.bankAccount || this.contact.businessId > 0 ) ) {
        if ( this.type == 'payable' )
          await this.setDefaultCurrency();

        this.setChosenBankAccount();
      }
      this.checkUser(this.currencyType);
    },
    function onCurrencyTypeChange() {
      this.selectedCurrency = this.currencyType;
      this.setChosenBankAccount();
      this.checkUser(this.currencyType);
    },
    function checkUser(currency) {
      var destinationCurrency = currency ? currency : 'CAD';
      var isPayable = this.type === 'payable';
      var partyId = isPayable ? this.invoice.contactId : this.subject.user.id;
      if ( partyId && destinationCurrency && this.invoice.contactId ) {
        var request = this.CanReceiveCurrency.create({
          userId: partyId,
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
    },
    async function setDefaultCurrency() {
      if ( this.invoice.contactId <= 0 ) return;
      var request = this.GetDefaultCurrency.create({
        contactId: this.invoice.contactId
      });
      try {
        var responseObj = await this.getDefaultCurrencyDAO.put(request);
        if ( responseObj ) {
          this.currencyType = responseObj.response;
          this.selectedCurrency = responseObj.response;
          this.invoice.destinationCurrency = responseObj.response;
        }
      } catch (e) {
        console.error('Error fetch default currency: ', e.message);
      }
    },
    async function setChosenBankAccount() {
      var isPayable = this.type === 'payable';

      if ( isPayable ) {
        this.chosenBankAccount = await this.subject.user.accounts.find(
          this.AND(
            this.INSTANCE_OF(this.BankAccount),
            this.EQ(this.BankAccount.IS_DEFAULT, true)
          )
        );
      } else {
        this.chosenBankAccount = await this.subject.user.accounts.find(
          this.AND(
            this.INSTANCE_OF(this.BankAccount),
            this.EQ(this.BankAccount.IS_DEFAULT, true),
            this.EQ(this.BankAccount.DENOMINATION, this.currencyType)
          )
        );
      }

      if ( ! this.chosenBankAccount ) {
        return;
      }
      if ( this.type === 'payable' ) {
        this.invoice.account = this.chosenBankAccount;
      } else {
        this.invoice.destinationAccount = this.chosenBankAccount;
      }
    }
  ],

  actions: [
    {
      name: 'addContact',
      label: 'Create new contact',
      icon: 'images/plus-no-bg.svg',
      code: function(X, e) {
        var self = X.data;
        X.ctrl.add(net.nanopay.ui.wizard.ContactWizardDetailView.create({
          model: 'net.nanopay.contacts.Contact',
          data$: self.addedContact$,
          controllerMode: foam.u2.ControllerMode.CREATE,
          onClose: self.setContactIdOnContactAdd.bind(self)
        }, X.ctrl));
      }
    },
    {
      name: 'accountCreate',
      label: 'Create a new bank account',
      icon: 'images/plus-no-bg.svg',
      code: async function(X, e) {
        let permission = await X.auth.check(null, 'multi-currency.read');
        if ( permission ) {
          X.pushMenu('sme.menu.addBankAccount');
        } else {
          let account = (foam.lookup(`net.nanopay.bank.${ X.subject.user.address.countryId }BankAccount`)).create({}, X.ctrl);
          X.ctrl.add(X.ctrl.SMEModal.create({}, X.ctrl).addClass('bank-account-popup').tag({
            class: 'net.nanopay.account.ui.BankAccountWizard',
            data: account,
            useSections: ['clientAccountInformation', 'pad']
          }));
        }
      }
    }
  ]
});
