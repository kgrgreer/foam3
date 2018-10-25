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
    'user',
    'hideNavFooter'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.PublicUserInfo',
    'net.nanopay.invoice.model.Invoice',
    'foam.u2.Element',
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 1000;
      margin: 0 !important;
      padding: 0 !important;
    }
    ^ .tab {
      border-radius: 4px;
      width: 200px;
      text-align: left;
      padding-left: 20px;
    }
    ^ .tab-border {
      border: solid 1.5px #604aff;
    }
    ^positionColumn {
      display: inline-block;
      width: 200px;
      vertical-align: top;
      margin-left: 30px;
      margin-right: 50px;
    }
    ^ .block {
      margin-top: 38px;
      width: 500px;
    }
    ^ .header {
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 16px;
    }
    ^ .invoice-details {
      background-color: white;
      padding: 15px;
      border-radius: 4px;
    }
    ^ .invoice-title {
      font-size: 26px;
      font-weight: 900;
    }
  `,

  messages: [
    { name: 'SEND_MONEY_HEADER', message: 'Create new or choose from existing' },
    { name: 'REQUEST_MONEY_HEADER', message: '' }
  ],

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
      name: 'myDAO',
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
        return this.myDAO.orderBy(this.DESC(this.Invoice.ISSUE_DATE));
      }
    },
    {
      name: 'hasSaveOption',
      value: true
    },
    {
      name: 'saveLabel',
      value: 'Save as draft'
    }
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'etransfer', id: 'send-money-details', label: 'Details', view: { class: 'net.nanopay.sme.ui.Details' } },
        { parent: 'etransfer', id: 'send-money-payment', label: 'Payment details', view: { class: 'net.nanopay.sme.ui.Payment' } },
        { parent: 'etransfer', id: 'send-money-review', label: 'Review', view: { class: 'net.nanopay.sme.ui.Review' } }
      ];

      // This is required to setup labels of the viewList
      this.SUPER();
    }
  ]
});
