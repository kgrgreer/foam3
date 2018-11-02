foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoney',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: `This class extends the general WizardView & is used for
                  both send money & request money. When user want to pay an
                  existing page, the app will redirect to this class.`,

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'notificationDAO',
    'stack',
    'user',
    'termsAndConditions'
  ],

  exports: [
    'invoice'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.invoice.model.InvoiceStatus',
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
    }
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
      left: 15vw;
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
      class: 'FObjectProperty',
      of: 'net.nanopay.invoice.model.Invoice',
      name: 'invoiceDetail'
    },
    'isPayable',
    'type',
    {
      name: 'newButton',
      value: true
    },
    'existingButton',
    'newButtonLabel',
    'existingButtonLabel',
    'detailContainer',
    {
      class: 'Boolean',
      name: 'isForm',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isList',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isDetailView',
      value: false
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      expression: function() {
        if ( this.type === 'payable' ) {
          return this.user.expenses;
        }
        return this.user.sales;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'filteredDAO',
      expression: function() {
        return this.dao.orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
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
    'userList',
    'nextLabel'
  ],

  methods: [
    function init() {
      this.title = this.isPayable === true ? 'Send money' : 'Request money';
      this.type = this.isPayable === true ? 'payable' : 'receivable';
      this.views = [
        { parent: 'sendRequestMoney', id: 'send-request-money-details', label: 'Details', view: { class: 'net.nanopay.sme.ui.SendRequestMoneyDetails', type: this.type } },
        { parent: 'sendRequestMoney', id: 'send-request-money-payment', label: 'Payment details', view: { class: 'net.nanopay.sme.ui.Payment', type: this.type } },
        { parent: 'sendRequestMoney', id: 'send-request-money-review', label: 'Review', view: { class: 'net.nanopay.sme.ui.SendRequestMoneyReview' } }
      ];

      this.exitLabel = 'Cancel';
      this.hasExitOption = true;

      // This is required to use the WizardView
      this.SUPER();
    },

    function invoiceDetailsValidation(invoice) {
      if ( ! invoice.payeeId || ! invoice.payerId ) {
        this.notify('Need to choose a contact');
      } else if ( ! invoice.amount || invoice.amount < 0 ) {
        this.notify('Invalid amount');
      } else if ( ! (invoice.dueDate instanceof Date && ! isNaN(invoice.dueDate.getTime())) ) {
        this.notify('Invalid due date');
      } else {
        this.subStack.push(this.views[this.subStack.pos + 1].view);
      }
    },

    function paymentValidation() {
      // TODO: check whether the account is validate or not
      if ( this.isPayable ) {
        if ( ! this.viewData.bankAccount ) {
          this.notify('Please select a bank account.');
        } else if ( ! this.viewData.quote ) {
          this.notify('There is an error to get the exchange rate.');
        } else if ( ! this.viewData.termsAndConditions ) {
          this.notify('Please agree with the terms & condition.');
        } else {
          this.subStack.push(this.views[this.subStack.pos + 1].view);
        }
      } else {
        if ( ! this.viewData.bankAccount ) {
          this.notify('Please select a bank account.');
        } else {
          this.subStack.push(this.views[this.subStack.pos + 1].view);
        }
      }
    },

    async function submit(invoice) {
      // TODO: add payment verification
      var isVerified = false;
      try {
        await this.dao.put(invoice);
        isVerified = true;
      } catch (error) {
        this.notify(error.message ? error.message : 'An error occurred while saving the invoice.', 'error');
        return;
      }
      if ( isVerified ) {
        ctrl.stack.push({
          class: 'net.nanopay.sme.ui.MoneyFlowSuccessView',
          invoice: this.invoice
        });
      }
    },

    async function saveDraft(invoice) {
      // Do not redirect after form validation
      if ( ! invoice.payeeId || ! invoice.payerId ) {
        this.notify('Need to choose a contact');
      } else if ( ! invoice.amount || invoice.amount < 0 ) {
        this.notify('Invalid amount');
      } else if ( ! (invoice.dueDate instanceof Date && ! isNaN(invoice.dueDate.getTime())) ) {
        this.notify('Invalid due date');
      } else {
        var isVerified = false;
        try {
          await this.dao.put(invoice);
          isVerified = true;
        } catch (error) {
          this.notify(error.message ? error.message : 'An error occurred while saving the draft invoice.', 'error');
          return;
        }
        if ( isVerified ) {
          this.notify('Draft invoice saved successfully');
          ctrl.stack.back();
        }
      }
    },

    function notify(message, type) {
      this.add(this.NotificationMessage.create({ message, type }));
    }
  ],

  actions: [
    {
      name: 'save',
      isAvailable: function(hasSaveOption) {
        return hasSaveOption;
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
      code: function() {
        var currentViewId = this.views[this.position].id;
        switch ( currentViewId ) {
          case this.DETAILS_VIEW_ID:
            this.invoiceDetailsValidation(this.invoice);
            break;
          case this.PAYMENT_VIEW_ID:
            this.paymentValidation();
            break;
          case this.REVIEW_VIEW_ID:
          console.log(this.viewData);
            this.submit(this.invoice);
            break;
          /* Redirect user back to dashboard if none
            of the above conditions are mathced
          */
          default:
            ctrl.stack.push({
              class: 'net.nanopay.sme.ui.dashboard.Dashboard'
            });
        }
      }
    },
    {
      name: 'exit',
      code: function() {
        // For qucick actions, the cencel button redirect users to dashboard
        if ( window.location.hash === '#sme.quickAction.send'
            || window.location.hash === '#sme.quickAction.request' ) {
          ctrl.stack.push({
            class: 'net.nanopay.sme.ui.dashboard.Dashboard'
          });
          return;
        }
        ctrl.stack.back();
      }
    }
  ]
});
