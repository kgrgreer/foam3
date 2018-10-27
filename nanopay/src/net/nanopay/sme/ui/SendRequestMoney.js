foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SendRequestMoney',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: '',

  implements: [
    'foam.mlang.Expressions',
  ],

  imports: [
    'notificationDAO',
    'publicUserDAO',
    'stack',
    'user'
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
    'userList'
  ],

  methods: [
    function init() {
      this.title = this.isPayable === true ? 'Send money' : 'Request money';
      this.type = this.isPayable === true ? 'payable' : 'receivable';

      this.views = [
        { parent: 'sendRequestMoney', id: 'send-request-money-details', label: 'Details', view: { class: 'net.nanopay.sme.ui.SendRequestMoneyDetails', invoice: this.invoice, type: this.type } },
        { parent: 'sendRequestMoney', id: 'send-request-money-payment', label: 'Payment details', view: { class: 'net.nanopay.sme.ui.Payment' } },
        { parent: 'sendRequestMoney', id: 'send-request-money-review', label: 'Review', view: { class: 'net.nanopay.sme.ui.SendRequestMoneyReview' } }
      ];

      // This is required to setup labels of the viewList
      this.SUPER();
    }
  ],


  actions: [
    {
      name: 'save',
      isAvailable: function(hasSaveOption) {
        return hasSaveOption;
      },
      code: function(X) {
        this.invoice.status = this.InvoiceStatus.DRAFT;
        this.invoice.draft = true;

        var self = this;
        this.dao.put(this.invoice).then(function() {
          self.stack.back();
        }).catch(function(e) {
          throw new Error('Error: ' + e.message);
        });
      }
    }
  ]
});
