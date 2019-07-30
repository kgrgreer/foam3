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
    'agent',
    'appConfig',
    'auth',
    'canReceiveCurrencyDAO',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'contactDAO',
    'ctrl',
    'fxService',
    'menuDAO',
    'notificationDAO',
    'notify',
    'pushMenu',
    'stack',
    'transactionDAO',
    'user',
    'userDAO',
    'quickbooksService',
    'xeroService'
  ],

  exports: [
    'existingButton',
    'invoice',
    'isApproving',
    'isDetailView',
    'isForm',
    'isList',
    'isPayable',
    'loadingSpin',
    'newButton',
    'predicate'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.app.Mode',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.ui.LoadingSpinner'
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
          return this.user.expenses;
        }
        return this.user.sales;
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
        return this.LoadingSpinner.create();
      }
    },
    {
      name: 'isLoading',
      value: false,
      postSet: function(_, n) {
        if ( n ) {
          this.loadingSpin.show();
          return;
        }
        this.loadingSpin.hide();
      }
    },
    {
      name: 'hasSaveOption',
      expression: function(isForm, position) {
        return isForm &&
          this.invoice.status !== this.InvoiceStatus.DRAFT &&
          position === 0;
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
    }
  ],

  messages: [
    { name: 'SAVE_DRAFT_ERROR', message: 'An error occurred while saving the draft ' },
    { name: 'INVOICE_ERROR', message: 'Invoice Error: An error occurred while saving the ' },
    { name: 'TRANSACTION_ERROR', message: 'Transaction Error: An error occurred while saving the ' },
    { name: 'BANK_ACCOUNT_REQUIRED', message: 'Please select a bank account that has been verified.' },
    { name: 'QUOTE_ERROR', message: 'An unexpected error occurred while fetching the exchange rate.' },
    { name: 'CONTACT_ERROR', message: 'Need to choose a contact.' },
    { name: 'AMOUNT_ERROR', message: 'Invalid Amount.' },
    { name: 'DUE_DATE_ERROR', message: 'Invalid Due Date.' },
    { name: 'DRAFT_SUCCESS', message: 'Draft saved successfully.' },
    { name: 'COMPLIANCE_ERROR', message: 'Business must pass compliance to make a payment.' },
    { name: 'CONTACT_NOT_FOUND', message: 'Contact not found.' },
    { name: 'INVOICE_AMOUNT_ERROR', message: 'This amount exceeds your sending limit.' },
    { name: 'WAITING_FOR_RATE', message: 'Waiting for FX quote.' },
    {
      name: 'TWO_FACTOR_REQUIRED',
      message: `You require two-factor authentication to continue this payment.
          Please go to the Personal Settings page to set up two-factor authentication.`
    }
  ],

  methods: [
    function init() {
      this.isLoading = false;
      if ( this.isApproving ) {
        this.title = 'Approve payment';
      } else {
        this.title = this.isPayable === true ? 'Send payment' : 'Request payment';
      }

      this.type = this.isPayable ? 'payable' : 'receivable';

      this.views = [
        {
          parent: 'sendRequestMoney',
          id: this.DETAILS_VIEW_ID,
          label: 'Details',
          subtitle: 'Select payable',
          view: {
            class: 'net.nanopay.sme.ui.SendRequestMoneyDetails',
            type: this.type
          }
        }
      ];

      if ( ! this.isApproving ) {
        this.views.push({
          parent: 'sendRequestMoney',
          id: this.PAYMENT_VIEW_ID,
          label: 'Payment details',
          subtitle: 'Select payment method',
          view: {
            class: 'net.nanopay.sme.ui.SendRequestMoneyPayment',
            type: this.type
          }
        });
      }

      this.views.push({
        parent: 'sendRequestMoney',
        id: this.REVIEW_VIEW_ID,
        label: 'Review',
        subtitle: 'Review payment',
        view: {
          class: 'net.nanopay.sme.ui.SendRequestMoneyReview'
        }
      });

      this.exitLabel = 'Cancel';
      this.hasExitOption = true;

      this.auth.check(this, 'invoice.pay').then((result) => {
        this.permitToPay = result;
      });

      this.SUPER();
    },

    function initE() {
      var checkAndNotifyAbility;

      var checkAndNotifyAbility = this.isPayable ?
        this.checkAndNotifyAbilityToPay :
        this.checkAndNotifyAbilityToReceive;

      checkAndNotifyAbility().then((result) => {
        if ( ! result ) {
          this.pushMenu('sme.main.dashboard');
          return;
        }
      });

      this.SUPER();
      this.addClass('full-screen');
    },

    function invoiceDetailsValidation(invoice) {
      if ( invoice.amount > this.Invoice.ABLII_MAX_AMOUNT ) {
        this.notify(this.INVOICE_AMOUNT_ERROR, 'error');
        return false;
      }
      if ( ! invoice.contactId ) {
        this.notify(this.CONTACT_ERROR, 'error');
        return false;
      } else if ( ! invoice.amount || invoice.amount < 0 ) {
        this.notify(this.AMOUNT_ERROR, 'error');
        return false;
      } else if ( ! (invoice.dueDate instanceof Date && ! isNaN(invoice.dueDate.getTime())) ) {
        this.notify(this.DUE_DATE_ERROR, 'error');
        return false;
      }
      return true;
    },

    function paymentValidation() {
      if ( ! this.viewData.bankAccount || ! foam.util.equals(this.viewData.bankAccount.status, net.nanopay.bank.BankAccountStatus.VERIFIED) ) {
        this.notify(this.BANK_ACCOUNT_REQUIRED, 'error');
        return false;
      } else if ( ! this.viewData.quote && this.isPayable ) {
        this.notify(this.QUOTE_ERROR, 'error');
        return false;
      }
      return true;
    },

    async function submit() {
      this.isLoading = true;
      var checkAndNotifyAbility;

      var checkAndNotifyAbility = this.isPayable ?
        this.checkAndNotifyAbilityToPay :
        this.checkAndNotifyAbilityToReceive;

      var result = await checkAndNotifyAbility();
      if ( ! result ) {
        return;
      }

      // Confirm Invoice information:
      this.invoice.draft = false;

      // invoice payer/payee should be populated from InvoiceSetDestDAO
      try {
        this.invoice = await this.invoiceDAO.put(this.invoice);
      } catch (error) {
        console.error('@SendRequestMoney (Invoice put): ' + error.message);
        this.notify(this.INVOICE_ERROR + this.type, 'error');
        this.isLoading = false;
        return;
      }

      // Uses the transaction retrieved from transactionQuoteDAO retrieved from invoiceRateView.
      if ( this.isPayable ) {
        var transaction = this.viewData.quote ? this.viewData.quote : null;
        transaction.invoiceId = this.invoice.id;
        if ( this.viewData.isDomestic ) {
          if ( ! transaction ) this.notify(this.QUOTE_ERROR, 'error');
          try {
            await this.transactionDAO.put(transaction);
          } catch (error) {
            console.error('@SendRequestMoney (Transaction put): ' + error.message);
            this.notify(this.TRANSACTION_ERROR + this.type, 'error');
            this.isLoading = false;
            return;
          }
        } else {
          try {
            transaction.isQuoted = true;
            await this.transactionDAO.put(transaction);
          } catch ( error ) {
            console.error('@SendRequestMoney (Accept and put transaction quote): ' + error.message);
            this.notify(this.TRANSACTION_ERROR + this.type, 'error');
            this.isLoading = false;
            return;
          }
        }
      }
      // Get the invoice again because the put to the transactionDAO will have
      // updated the invoice's status and other fields like transactionId.

      try {
        if ( this.invoice.id != 0 ) this.invoice = await this.invoiceDAO.find(this.invoice.id);
        else this.invoice = await this.invoiceDAO.put(this.invoice); // Flow for receivable

        let service = null;
        if ( this.invoice.xeroId && this.invoice.status == this.InvoiceStatus.PROCESSING )  service = this.xeroService;
        if ( this.invoice.quickId && this.invoice.status == this.InvoiceStatus.PROCESSING ) service = this.quickbooksService;

        if ( service != null ) service.invoiceResync(null, this.invoice);

        ctrl.stack.push({
          class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
          invoice: this.invoice
        });
      } catch ( error ) {
        this.isLoading = false;
        console.error('@SendRequestMoney (Invoice/Integration Sync): ' + error.message);
        this.notify(this.TRANSACTION_ERROR + this.type, 'error');
        return;
      }
      this.isLoading = false;
    },

    // Validates invoice and puts draft invoice to invoiceDAO.
    async function saveDraft(invoice) {
      if ( ! this.invoiceDetailsValidation(this.invoice) ) return;
      try {
        await this.invoiceDAO.put(invoice);
        this.notify(this.DRAFT_SUCCESS);
        this.pushMenu(this.isPayable
          ? 'sme.main.invoices.payables'
          : 'sme.main.invoices.receivables');
      } catch (error) {
        console.error('@SendRequestMoney (Invoice put after quote transaction put): ' + error.message);
        this.notify(this.SAVE_DRAFT_ERROR + this.type, 'error');
        return;
      }
    },
    async function populatePayerIdOrPayeeId() {
      try {
        var contact = await this.user.contacts.find(this.invoice.contactId);
        if ( this.isPayable ) {
          this.invoice.payeeId = contact.businessId || contact.id;
        } else {
          this.invoice.payerId = contact.businessId || contact.id;
        }
      } catch (err) {
        if ( this.invoice.payerId && this.invoice.payeeId && err.id == 'foam.nanos.auth.AuthorizationException' ) return;
        console.error('@SendRequestMoney (Populate invoice fields): ' + err.message);
        this.notify(this.CONTACT_NOT_FOUND, 'error');
      }
    }
  ],

  actions: [
    {
      name: 'save',
      isAvailable: function(hasSaveOption) {
        return hasSaveOption;
      },
      isEnabled: function(errors) {
        return ! errors;
      },
      code: function() {
        this.invoice.status = this.InvoiceStatus.DRAFT;
        this.invoice.draft = true;
        this.saveDraft(this.invoice);
      }
    },
    {
      name: 'goNext',
      isAvailable: function(hasNextOption) {
        return hasNextOption;
      },
      isEnabled: function(errors) {
        return ! errors && ! this.isLoading;
      },
      code: function() {
        var currentViewId = this.views[this.position].id;
        switch ( currentViewId ) {
          case this.DETAILS_VIEW_ID:
            if ( ! this.invoiceDetailsValidation(this.invoice) ) return;
            if ( ! this.agent.twoFactorEnabled && this.isPayable && this.permitToPay ) {
              if ( this.appConfig.mode === this.Mode.PRODUCTION ||
                   this.appConfig.mode === this.Mode.DEMO ) {
                this.notify(this.TWO_FACTOR_REQUIRED, 'error');
                return;
              } else {
                // report but don't fail/error - facilitates automated testing
                this.notify(this.TWO_FACTOR_REQUIRED, 'warning');
              }
           }
            this.populatePayerIdOrPayeeId().then(() => {
              this.subStack.push(this.views[this.subStack.pos + 1].view);
            });
            break;
          case this.PAYMENT_VIEW_ID:
            if ( ! this.paymentValidation() ) return;
            this.populatePayerIdOrPayeeId().then(() => {
              this.subStack.push(this.views[this.subStack.pos + 1].view);
            });
            break;
          case this.REVIEW_VIEW_ID:
            if ( ! this.viewData.quote && this.isPayable && ! this.viewData.isDomestic ) {
              this.notify(this.WAITING_FOR_RATE, 'warning');
              return;
            }
            this.submit();
            break;
          /* Redirects users back to dashboard if none
             of the above conditions are matched */
          default:
            this.pushMenu('sme.main.dashboard');
        }
      }
    },
    {
      name: 'exit',
      code: function() {
        if ( this.stack.depth === 1 ) {
          this.pushMenu('sme.main.dashboard');
        } else {
          this.stack.back();
        }
      }
    }
  ]
});
