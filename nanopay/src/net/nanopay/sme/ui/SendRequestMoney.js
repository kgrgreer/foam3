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
  name: 'SendRequestMoney',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: `This class extends the general WizardView & is used for
                  both sending & requesting money. When a user wants to pay from
                  the invoice overview view, the app will redirect to this view.`,

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'appConfig',
    'auth',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'crunchController',
    'crunchService',
    'contactDAO',
    'ctrl',
    'fxService',
    'menuDAO',
    'notify',
    'pushMenu',
    'quickbooksService',
    'stack',
    'subject',
    'theme',
    'transactionDAO',
    'transactionPlannerDAO',
    'userDAO',
    'xeroService',
  ],

  exports: [
    'existingButton',
    'invoice',
    'isApproving',
    'isDetailView',
    'isForm',
    'isList',
    'isLoading',
    'isPayable',
    'loadingSpin',
    'newButton',
    'predicate',
    'txnQuote'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.app.Mode',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CapabilityIntercept',
    'foam.nanos.auth.LifecycleState',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.fx.FXLineItem',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus',
    'net.nanopay.tx.AbliiTransaction',
    'net.nanopay.tx.ExpiredTransactionException',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.FxSummaryTransactionLineItem',
    'net.nanopay.tx.TransactionQuote',
    'foam.u2.LoadingSpinner',
    'foam.u2.dialog.Popup'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  css: `
    ^ .title {
      font-size: 26px !important;
      font-weight: 900 !important;
      margin-top: 20px !important;
      margin-bottom: 15px !important;
      margin-left: 50px !important;
    }
    ^ .positionColumn {
      padding-left: 50px !important;
    }
    ^ .subTitle {
      display: none !important;
    }
    ^ .wizardBody {
      position: relative;
      width: 992px;
      margin: auto;
    }
    ^ .navigationContainer {
      width: 100%;
    }
    ^ .exitContainer {
      display: flex;
    }
    ^ .net-nanopay-sme-ui-InfoMessageContainer {
      font-size: 14px;
      line-height: 1.5;
      margin-top: 35px;
    }
    ^ .foam-u2-LoadingSpinner{
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      position: absolute;
    }
    ^ .stackColumn .foam-u2-stack-StackView {
      padding-left: 0 !important;
    }
    ^ .foam-u2-ActionView-large {
      max-height: 50px;
    }
  `,

  constants: {
    DETAILS_VIEW_ID: 'send-request-money-details',
    PAYMENT_VIEW_ID: 'send-request-money-payment',
    REVIEW_VIEW_ID: 'send-request-money-review'
  },

  properties: [
    {
      class: 'Boolean',
      name: 'isPayable',
      documentation: 'Determines displaying certain elements related to payables or receivables.'
    },
    {
      class: 'Boolean',
      name: 'isApproving',
      documentation: 'When true, wizard will be used for approving payables made by employees with lower authorization levels.',
      postSet: function(_, newV) {
        this.isPayable = true;
      }
    },
    {
      // TODO: change this property to an eunm
      class: 'String',
      name: 'type',
      documentation: 'Associated to type of wizard. Payable or receivables. Used as GUI representation.'
    },
    {
      class: 'Boolean',
      name: 'newButton',
      expression: function(isForm) {
        return isForm;
      },
      documentation: 'This property is for the new button border highlight.'
    },
    {
      class: 'Boolean',
      name: 'existingButton',
      expression: function(isForm) {
        return ! isForm;
      },
      documentation: 'This property is for the existing button border highlight.'
    },
    {
      class: 'Boolean',
      name: 'isForm',
      value: true,
      documentation: `Form stands for the new invoice form
      or the draft invoice form.`
    },
    {
      class: 'Boolean',
      name: 'isDetailView',
      value: false,
      documentation: 'DetailView stands for the invoice detail view.'
    },
    {
      class: 'Boolean',
      name: 'isList',
      value: false,
      documentation: 'List stands for the invoice list'
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'invoiceDAO',
      expression: function(isPayable) {
        if ( isPayable ) {
          return this.subject.user.expenses;
        }
        return this.subject.user.sales;
      }
    },
    {
      name: 'predicate',
      documentation: `
        Set this if you want to filter the list of existing invoices by some
        predicate when pushing this view on the stack.
      `
    },
    {
      name: 'loadingSpin',
      factory: function() {
        return this.LoadingSpinner.create({ size: 56 });
      }
    },
    {
      name: 'isLoading',
      value: false,
      postSet: function(_, n) {
        this.loadingSpin.text = this.PROCESSING_NOTICE;
        if ( n ) {
          this.loadingSpin.show();
          this.loadingSpin.showText = true;
          return;
        }
        this.loadingSpin.hide();
        this.loadingSpin.showText = false;
      }
    },
    {
      name: 'hasSaveOption',
      expression: function(isForm, position) {
        return this.invoice.status !== this.InvoiceStatus.PROCESSING;
      },
      documentation: `An expression is required for the 1st step of the
        send/request payment flow to show the 'Save as draft' button.`
    },
    {
      name: 'hasNextOption',
      expression: function(isList) {
        return ! isList;
      },
      documentation: `An expression is required for the 1st step of the
        send/request payment flow to show the 'Save as draft' button.`
    },
    {
      name: 'hasExitOption',
      value: true
    },
    {
      name: 'saveLabel',
      value: 'Save as draft',
      documentation: 'This property is for the customized label of save button'
    },
    {
      class: 'FObjectProperty',
      name: 'invoice',
      factory: function() {
        return this.Invoice.create({});
      }
    },
    {
      class: 'Boolean',
      name: 'permitToPay'
    },
    {
      class: 'FObjectProperty',
      name: 'txnQuote',
    }
  ],

  messages: [
    { name: 'SAVE_DRAFT_ERROR', message: 'An error occurred while saving the draft ' },
    { name: 'SAVE_ERROR', message: 'An error occurred while saving the ' },
    { name: 'BANK_ACCOUNT_REQUIRED', message: 'Please select a bank account that has been verified' },
    { name: 'QUOTE_ERROR', message: 'An unexpected error occurred while fetching the exchange rate' },
    { name: 'CONTACT_ERROR', message: 'Need to choose a contact' },
    { name: 'AMOUNT_ERROR', message: 'Invalid Amount' },
    { name: 'DUE_DATE_ERROR', message: 'Invalid Due Date' },
    { name: 'ISSUE_DATE_ERROR', message: 'Invalid Issue Date' },
    { name: 'DRAFT_SUCCESS', message: 'Draft saved successfully' },
    { name: 'DELETE_SUCCESS', message: 'Invoice deleted successfully' },
    { name: 'COMPLIANCE_ERROR', message: 'Business must pass compliance to make a payment' },
    { name: 'CONTACT_NOT_FOUND', message: 'Contact not found' },
    { name: 'INVOICE_AMOUNT_ERROR', message: 'This amount exceeds your sending limit' },
    { name: 'WAITING_FOR_RATE', message: 'Waiting for FX quote' },
    { name: 'RATE_REFRESH', message: 'The exchange rate expired, please ' },
    { name: 'RATE_REFRESH_SUBMIT', message: ' submit again.' },
    { name: 'RATE_REFRESH_APPROVE', message: ' approve again.' },
    { name: 'PROCESSING_NOTICE', message: 'Processing your transaction, this can take up to 30 seconds.' },
    {
      name: 'TWO_FACTOR_REQUIRED',
      message: `You require two-factor authentication to continue this payment.
          Please go to the Personal Settings page to set up two-factor authentication.`
    },
    { name: 'SEND_PAYMENT', message: 'Send payment' },
    { name: 'REQUEST_PAYMENT', message: 'Request payment' },
    { name: 'INVOICE_DETAILS', message: 'Invoice details' },
    { name: 'SELECT_PAYABLE', message: 'Select payable' },
    { name: 'REVIEW_MSG', message: 'Review' },
    { name: 'REVIEW_PAYMENT', message: 'Review payment'},
    { name: 'DELETE', message: 'Delete'},
    { name: 'VOID', message: 'Void'}
  ],

  methods: [
    function init() {
      this.isLoading = false;
      this.loadingSpin.onDetach(() => {
        this.loadingSpin = undefined;
        this.loadingSpin;
      });
      if ( this.isApproving ) {
        this.title = 'Approve payment';
      } else {
        this.title = this.isPayable === true ? this.SEND_PAYMENT : this.REQUEST_PAYMENT;
      }

      this.type = this.isPayable ? 'payable' : 'receivable';

      this.views = [
        {
          parent: 'sendRequestMoney',
          id: this.DETAILS_VIEW_ID,
          label: this.INVOICE_DETAILS,
          subtitle: this.SELECT_PAYABLE,
          view: {
            class: 'net.nanopay.sme.ui.SendRequestMoneyDetails',
            type: this.type
          }
        }
      ];

      this.views.push({
        parent: 'sendRequestMoney',
        id: this.REVIEW_VIEW_ID,
        label: this.REVIEW_MSG,
        subtitle: this.REVIEW_PAYMENT,
        view: {
          class: 'net.nanopay.sme.ui.SendRequestMoneyReview'
        }
      });

      this.exitLabel = this.DELETE;
      this.optionLabel = this.VOID;
      this.hasExitOption = true;

      Promise.all([this.auth.check(null, 'business.invoice.pay'), this.auth.check(null, 'user.invoice.pay')])
        .then(results => {
          this.permitToPay = results[0] && results[1];
        });

      this.SUPER();
    },

    function initE() {
      var checkAndNotifyAbility;

      var checkAndNotifyAbility = this.isPayable ?
        this.checkAndNotifyAbilityToPay :
        this.checkAndNotifyAbilityToReceive;

      checkAndNotifyAbility().then(result => {
        if ( ! result ) {
          this.pushMenu('mainmenu.dashboard');
          return;
        }
      });

      this.SUPER();
      this.addClass('full-screen');
    },

    function invoiceDetailsValidation(invoice) {
      if ( invoice.amount > this.Invoice.ABLII_MAX_AMOUNT ) {
        this.notify(this.INVOICE_AMOUNT_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! invoice.contactId ) {
        this.notify(this.CONTACT_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      } else if ( ! invoice.amount || invoice.amount < 0 ) {
        this.notify(this.AMOUNT_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      } else if ( ! (invoice.dueDate instanceof Date && ! isNaN(invoice.dueDate.getTime())) ) {
        this.notify(this.DUE_DATE_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      } else if ( ! (invoice.issueDate instanceof Date && ! isNaN(invoice.issueDate.getTime())) ) {
        this.notify(this.ISSUE_DATE_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      } else if ( invoice.account == 0 && invoice.destinationAccount == 0  ) {
        this.notify(this.BANK_ACCOUNT_REQUIRED, '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },

    async function paymentValidation() {
      if ( ! this.viewData.bankAccount || ! foam.util.equals(this.viewData.bankAccount.status, net.nanopay.bank.BankAccountStatus.VERIFIED) ) {
        this.notify(this.BANK_ACCOUNT_REQUIRED, '', this.LogLevel.ERROR, true);
        return false;
      } else if ( ! this.invoice.quote && this.isPayable ) {
        this.notify(this.QUOTE_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      }

      return true;
    },

    async function getQuote() {
      this.invoice.quote = null;
      this.invoice.paymentMethod = this.PaymentStatus.SUBMIT;

      // to be able to adjust capable payloads that were previously saved
      if ( this.invoice.draft && this.invoice.capabilityIds.length > 0 && this.invoice.capablePayloads.length > 0 ) {
        this.invoice.draft = false;

        var capabilityIntercept = this.CapabilityIntercept.create();
        capabilityIntercept.daoKey = "invoiceDAO"

        var wizardSeq = this.crunchController.createCapableWizardSequence(capabilityIntercept, this.invoice);

        try {
          var wizardContext = await wizardSeq.execute();
        } catch (err) {
          await this.abortQuoteAndSaveDraft(err);
          return;
        }

        if ( ! wizardContext.submitted ) {
          this.invoice.draft = true;
          this.saveDraft(this.invoice);
          return;
        }
      }

      this.invoice.draft = false;

      // to preserve any invoice created as a draft in case of failure
      if ( this.invoice.id === 0 ) {
        this.invoice.draft = true;
        try{
          this.invoice = await this.invoiceDAO.put(this.invoice);
        } catch(err) {
          await this.abortQuoteAndSaveDraft(err);
        }
        this.invoice.draft = false;
      }

      try {
        this.invoice = await this.invoiceDAO.put(this.invoice);
        if ( this.invoice.capabilityIds.length > 0 && this.invoice.isWizardIncomplete ) {
          this.invoice.draft = true;
          this.saveDraft(this.invoice);
          return;
        }

        this.invoice = await this.invoiceDAO.find(this.invoice.id);
      } catch(err) {
        await this.abortQuoteAndSaveDraft(err);
        return;
      }

      if ( ! this.invoice.quote ) {
        this.abortQuoteAndSaveDraft(new Error(this.QUOTE_MISSING));
        return;
      }
      this.txnQuote = this.invoice.quote.plan;
      return this.txnQuote;
    },

    /**
     * Primarily used when receiving an exception from the back-end, to put the invoice
     * into a resubmittable state and save it as a draft
     * @param {*} error
     */
    async function abortQuoteAndSaveDraft(error) {
      this.invoice.paymentMethod = this.PaymentStatus.SUBMIT;
      this.invoice.status = this.InvoiceStatus.DRAFT;
      this.invoice.draft = true;
      this.invoice.quote = null;
      this.invoice.plan = null;
      this.invoice.capablePayloads.forEach(cp => cp.status = this.CapabilityJunctionStatus.ACTION_REQUIRED);
      this.invoiceDAO.put(this.invoice);
      this.notify(error.message,'', this.LogLevel.ERROR, true);
      this.pushMenu(this.isPayable
        ? 'mainmenu.invoices.payables'
        : 'mainmenu.invoices.receivables');
    },

    async function setTransactionPlanAndQuote() {
      this.isLoading = true;
      if ( this.isPayable ) {
        await this.getQuote();
      }
      this.isLoading = false;
    },

    async function submit() {
      this.isLoading = true;
      // TODO: perhaps all of these capabilities should imply something so
      //   a similar capability can be added without updating this code.
      let isSigningOfficer = await this.crunchService.atLeastOneInCategory(null, "complianceSetting");

      try {
        if ( this.isPayable && isSigningOfficer ) {
          let transaction = this.invoice.quote.plan;

          this.invoice.plan = transaction;
          this.invoice = await this.invoiceDAO.put(this.invoice);
          if ( ! this.invoice.paymentId ) {
            this.isLoading = false;
            console.error('@SendRequestMoney: missing paymentId');
            this.notify(this.SAVE_ERROR + this.type, '', this.LogLevel.ERROR, true);
            return;
          }
        } else if ( this.isPayable ) {
          this.invoice.paymentMethod = this.PaymentStatus.PENDING_APPROVAL;
          this.invoiceDAO.put(this.invoice);
        } else {
          this.invoiceDAO.put(this.invoice);
        }
        // this.invoice.processPaymentOnCreate = false;

        // if ( this.invoice.id != 0 ) this.invoice = await this.invoiceDAO.find(this.invoice.id);
        // else this.invoice = await this.invoiceDAO.put(this.invoice); // Flow for receivable

        let service;
        if ( this.invoice.xeroId && this.invoice.status == this.InvoiceStatus.PROCESSING )  service = this.xeroService;
        if ( this.invoice.quickId && this.invoice.status == this.InvoiceStatus.PROCESSING ) service = this.quickbooksService;

        if ( service ) service.invoiceResync(null, this.invoice);
        ctrl.stack.push({
          class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
          invoice: this.invoice,
          isApprover_: isSigningOfficer
        });
      } catch ( error ) {
        // check if plan expired
        if ( this.ExpiredTransactionException.isInstance(error.data.exception) ) {
          this.invoice.paymentMethod = this.PaymentStatus.QUOTED;
          this.invoice.paymentId = '';
          this.invoice.quote = null;
          this.invoice.plan = null;
          this.invoice = await this.invoiceDAO.put(this.invoice);
          this.notify(this.RATE_REFRESH, '', this.LogLevel.WARN, true);
          this.isLoading = false;
          return;
        }
        this.isLoading = false;
        console.error('@SendRequestMoney (Invoice/Integration Sync): ' + error.message);
        this.notify(this.SAVE_ERROR + this.type, '', this.LogLevel.ERROR, true);
        this.invoice.quote.plan = null;
        return;
      }
      this.isLoading = false;
    },

    // Validates invoice and puts draft invoice to invoiceDAO.
    async function saveDraft(invoice) {
      if ( ! this.invoiceDetailsValidation(this.invoice) ) return;
      try {
        await this.invoiceDAO.put(invoice);
        this.notify(this.DRAFT_SUCCESS, '', this.LogLevel.INFO, true);
        this.pushMenu(this.isPayable
          ? 'mainmenu.invoices.payables'
          : 'mainmenu.invoices.receivables');
      } catch (error) {
        console.error('@SendRequestMoney (Invoice put after quote transaction put): ' + error.message);
        this.notify(this.SAVE_DRAFT_ERROR + this.type, '', this.LogLevel.ERROR, true);
        return;
      }
    },
    async function populatePayerIdOrPayeeId() {
      try {
        if ( ! this.invoice.payee || ! this.invoice.payer ) {
          var contact = await this.subject.user.contacts.find(this.invoice.contactId);
          if ( this.isPayable ) {
            this.invoice.payeeId = contact.businessId || contact.id;
          } else {
            this.invoice.payerId = contact.businessId || contact.id;
          }
        }
      } catch (err) {
        if ( this.invoice.payerId && this.invoice.payeeId && err.id == 'foam.nanos.auth.AuthorizationException' ) return;
        console.error('@SendRequestMoney (Populate invoice fields): ' + err.message);
        this.notify(this.CONTACT_NOT_FOUND, '', this.LogLevel.ERROR, true);
      }
    }
    ],

    actions: [
    {
      name: 'save',
      isAvailable: function(hasSaveOption) {
        return hasSaveOption;
      },
      isEnabled: function(errors, isLoading) {
        return ! errors && ! isLoading;
      },
      code: function() {
        this.invoice.paymentMethod = this.PaymentStatus.SUBMIT;
        this.invoice.status = this.InvoiceStatus.DRAFT;
        this.invoice.draft = true;
        this.invoice.quote = null;
        this.invoice.plan = null;
        this.invoice.capablePayloads.forEach(cp => cp.status = this.CapabilityJunctionStatus.ACTION_REQUIRED);
        this.saveDraft(this.invoice);
      }
    },
    {
      name: 'goNext',
      buttonStyle: 'PRIMARY',
      isEnabled: function(errors, isLoading) {
        return ! errors && ! isLoading;
        // if ( this.subject.user.address.countryId === 'CA' ) {
        //   return ! errors && ! isLoading;
        // } else {
        //   return this.auth.check(null, 'strategyreference.read.9319664b-aa92-5aac-ae77-98daca6d754d').then(function(cadPerm) {
        //     return cadPerm && ! errors && ! isLoading;
        //   });
        // }
      },
      code: async function() {
        var currentViewId = this.views[this.position].id;

        switch ( currentViewId ) {
          case this.DETAILS_VIEW_ID:
            if ( ! this.invoiceDetailsValidation(this.invoice) ) return;
            if ( this.theme.twoFactorEnabled &&
                 ! this.subject.realUser.twoFactorEnabled &&
                 this.isPayable &&
                 this.permitToPay ) {
              if ( this.appConfig.mode === this.Mode.PRODUCTION ||
                   this.appConfig.mode === this.Mode.DEMO ) {
                this.notify(this.TWO_FACTOR_REQUIRED, '', this.LogLevel.ERROR, true);
                return;
              } else {
                // report but don't fail/error - facilitates automated testing
                this.notify(this.TWO_FACTOR_REQUIRED, '', this.LogLevel.WARN, true);
              }
            }
            this.populatePayerIdOrPayeeId().then(() => {
              this.subStack.push({ class: 'foam.u2.LoadingSpinner', size: 56 });
              this.position = this.subStack.pos - 1;
              this.setTransactionPlanAndQuote().then(
                () => {
                  this.subStack.back();
                  this.subStack.push(this.views[this.subStack.pos + 1].view);
                }
              );
            });
            break;
          case this.REVIEW_VIEW_ID:
            this.submit();
            break;
          /* Redirects users back to dashboard if none
            of the above conditions are matched */
          default:
            this.pushMenu('mainmenu.dashboard');
        }
      }
    },
    {
      name: 'exit',
      isEnabled: function(errors, isLoading) {
        return ! isLoading;
      },
      code: function() {
        if ( this.invoice.id !== 0 ){
          this.invoiceDAO.remove(this.invoice);
        }

        this.notify(this.DELETE_SUCCESS,'', this.LogLevel.INFO, true);
        this.pushMenu(this.isPayable
          ? 'mainmenu.invoices.payables'
          : 'mainmenu.invoices.receivables');
      }
    },
    {
      name: 'goBack',
      isEnabled: function(isLoading) {
        return ! isLoading;
      },
      isAvailable: function(hasBackOption) {
        return hasBackOption;
      },
      code: function(X) {
        if ( this.position <= 0 ) {
          X.stack.back();
          return;
        }
        this.subStack.back();
      }
    }
  ]
});
