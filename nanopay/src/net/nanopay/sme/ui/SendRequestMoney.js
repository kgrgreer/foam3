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
    'canReceiveCurrencyDAO',
    'ctrl',
    'menuDAO',
    'notificationDAO',
    'stack',
    'transactionDAO',
    'user'
  ],

  exports: [
    'existingButton',
    'invoice',
    'isDetailView',
    'isForm',
    'isList',
    'newButton',
    'predicate',
    'isApproving'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.bank.CanReceiveCurrency',
    'net.nanopay.contacts.ContactStatus',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.tx.model.Transaction'
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
      value: true
    },
    {
      class: 'Boolean',
      name: 'isDetailView',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isList',
      value: false
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
      name: 'hasSaveOption',
      value: true
    },
    {
      name: 'hasNextOption',
      value: true
    },
    {
      name: 'hasExitOption',
      value: true
    },
    {
      name: 'saveLabel',
      value: 'Save as draft'
    },
    {
      class: 'FObjectProperty',
      name: 'invoice',
      factory: function() {
        return this.Invoice.create({});
      }
    },
    'nextLabel'
  ],

  messages: [
    { name: 'SAVE_DRAFT_ERROR', message: 'An error occurred while saving the draft ' },
    { name: 'INVOICE_ERROR', message: 'An error occurred while saving the ' },
    { name: 'TRANSACTION_ERROR', message: 'An error occurred while saving the ' },
    { name: 'BANK_ACCOUNT_REQUIRED', message: 'Please select a bank account.' },
    { name: 'QUOTE_ERROR', message: 'There is an error to get the exchange rate.' },
    { name: 'CONTACT_ERROR', message: 'Please choose a contact.' },
    { name: 'AMOUNT_ERROR', message: 'Invalid Amount.' },
    { name: 'DUE_DATE_ERROR', message: 'Invalid Due Date.' },
    { name: 'DRAFT_SUCCESS', message: 'Draft saved successfully.' }
  ],

  methods: [
    function init() {
      if ( this.isApproving ) {
        this.title = 'Approve payment'
      } else {
        this.title = this.isPayable === true ? 'Send payment' : 'Request payment';
      }

      this.type = this.isPayable === true ? 'payable' : 'receivable';

      this.views = [
        { parent: 'sendRequestMoney', id: this.DETAILS_VIEW_ID, label: 'Details', subtitle: 'Select payable', view: { class: 'net.nanopay.sme.ui.SendRequestMoneyDetails', type: this.type } }
      ];

      if ( ! this.isApproving ) {
        this.views.push({ parent: 'sendRequestMoney', id: this.PAYMENT_VIEW_ID, label: 'Payment details', subtitle: 'Select payment method', view: { class: 'net.nanopay.sme.ui.Payment', type: this.type } });
      }

      this.views.push({ parent: 'sendRequestMoney', id: this.REVIEW_VIEW_ID, label: 'Review', subtitle: 'Review payment', view: { class: 'net.nanopay.sme.ui.SendRequestMoneyReview' } })

      this.exitLabel = 'Cancel';
      this.hasExitOption = true;

      this.SUPER();
    },

    function initE() {
      this.SUPER();
      this.addClass('full-screen');
    },

    function invoiceDetailsValidation(invoice) {
      if ( ! invoice.payeeId || ! invoice.payerId ) {
        this.notify(this.CONTACT_ERROR);
        return false;
      } else if ( ! invoice.amount || invoice.amount < 0 ) {
        this.notify(this.AMOUNT_ERROR);
        return false;
      } else if ( ! (invoice.dueDate instanceof Date && ! isNaN(invoice.dueDate.getTime())) ) {
        this.notify(this.DUE_DATE_ERROR);
        return false;
      }
      return true;
    },

    function paymentValidation() {
      // TODO: check whether the account is validate or not
      if ( ! this.viewData.bankAccount ) {
        this.notify(this.BANK_ACCOUNT_REQUIRED);
      } else if ( ! this.viewData.quote ) {
        this.notify(this.QUOTE_ERROR);
      } else {
        this.subStack.push(this.views[this.subStack.pos + 1].view);
      }
    },

    async function submit() {
      this.invoice.draft = false;

      // Make sure the 'external' property is set correctly.
      var contactId = this.isPayable ?
        this.invoice.payeeId :
        this.invoice.payerId;
      var contact = await this.user.contacts.find(contactId);
      this.invoice.external =
        contact.signUpStatus !== this.ContactStatus.ACTIVE;

      try {
        this.invoice = await this.invoiceDAO.put(this.invoice);
      } catch (error) {
        this.notify(error.message || this.INVOICE_ERROR + this.type, 'error');
        return;
      }

      // Uses the transaction retrieved from transactionQuoteDAO retrieved from invoiceRateView.
      if ( this.isPayable ) {
        var transaction = this.viewData.quote ? this.viewData.quote : null;
        if ( ! transaction ) this.notify(this.QUOTE_ERROR);
        transaction.invoiceId = this.invoice.id;
        try {
          await this.transactionDAO.put(transaction);
        } catch (error) {
          this.notify(error.message || this.TRANSACTION_ERROR + this.type, 'error');
          return;
        }
      }
      // Get the invoice again because the put to the transactionDAO will have
      // updated the invoice's status and other fields like transactionId.
      this.invoice = await this.invoiceDAO.find(this.invoice.id);
      ctrl.stack.push({
        class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
        invoice: this.invoice
      });
    },

    // Validates invoice and puts draft invoice to invoiceDAO.
    async function saveDraft(invoice) {
      if ( ! this.invoiceDetailsValidation(this.invoice) ) return;
      try {
        await this.invoiceDAO.put(invoice);
        this.notify(this.DRAFT_SUCCESS);
        this.stack.back();
      } catch (error) {
        this.notify(error.message ? error.message : this.SAVE_DRAFT_ERROR + this.type, 'error');
        return;
      }
    },

    function notify(message, type) {
      this.ctrl.add(this.NotificationMessage.create({ message, type }));
    }
  ],

  actions: [
    {
      name: 'save',
      isAvailable: function(hasSaveOption) {
        return hasSaveOption;
      },
      isEnabled: function(errors) {
        return ! ! errors;
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
        return ! errors;
      },
      code: function() {
        var currentViewId = this.views[this.position].id;
        switch ( currentViewId ) {
          case this.DETAILS_VIEW_ID:
            if ( ! this.invoiceDetailsValidation(this.invoice) ) return;
            this.subStack.push(this.views[this.subStack.pos + 1].view);
            break;
          case this.PAYMENT_VIEW_ID:
            this.paymentValidation();
            break;
          case this.REVIEW_VIEW_ID:
            this.submit();
            break;
          /* Redirects users back to dashboard if none
            of the above conditions are matched
          */
          default:
            this.stack.push({
              class: 'net.nanopay.sme.ui.dashboard.Dashboard'
            });
        }
      }
    },
    {
      name: 'exit',
      code: function() {
        // Cannot just use `this.stack.back`, for #4461
        var location = this.isPayable ? 'sme.main.invoices.payables'
          : 'sme.main.invoices.receivables';
        this.menuDAO
        .find(location)
        .then((menu) => menu.launch());
      }
    }
  ]
});
