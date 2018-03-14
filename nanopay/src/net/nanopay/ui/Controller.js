foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',

  documentation: 'Nanopay Top-Level Application Controller.',

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.CurrencyFormatter',
    'net.nanopay.util.AddCommaFormatter',
    'net.nanopay.util.FormValidation'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.model.Account',
    'net.nanopay.model.BankAccount',
    'net.nanopay.model.Currency',
    'net.nanopay.ui.style.AppStyles',
    'net.nanopay.ui.modal.ModalStyling',
    'net.nanopay.invoice.ui.style.InvoiceStyles'
  ],

  exports: [
    'account',
    'privacyUrl',
    'termsUrl',
    'as ctrl',
    'findAccount'
  ],

  css: `
    .stack-wrapper {
      /* 65px for topNav || 20px for padding || 40px for footer */
      min-height: calc(100% - 65px - 20px - 40px) !important;
      padding: 10px 0;
      margin-bottom: 0 !important;
    }

    .stack-wrapper:after {
      content: "";
      display: block;
    }

    .foam-comics-DAOUpdateControllerView .property-transactionLimits .net-nanopay-ui-ActionView-addItem {
      height: auto;
      padding: 3px;
      width: auto;
    }

    .foam-comics-DAOControllerView .foam-u2-view-TableView-row {
      height: 40px;
    }

    .foam-u2-view-TableView .net-nanopay-ui-ActionView {
      height: auto;
      padding: 8px;
      width: auto;
    }
    .net-nanopay-ui-ActionView-exportButton {
      float: right;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      width: 75px !important;
      height: 40px;
      cursor: pointer;
      z-index: 100;
      margin-right: 5px;
    }
    .net-nanopay-ui-ActionView-exportButton img {
      margin-right: 5px;
    }
  `,

  properties: [
    'privacyUrl',
    'termsUrl',
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.model.Account',
      name: 'account',
      factory: function() { return this.Account.create(null, self.clientContext); }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      self.clientPromise.then(function() {
        self.AppStyles.create(null, self.clientContext);
        self.InvoiceStyles.create(null, self.clientContext);
        self.ModalStyling.create(null, self.clientContext);

        foam.__context__.register(net.nanopay.ui.ActionView, 'foam.u2.ActionView');

        self.findAccount();

        self
          .addClass(self.myClass())
          .tag({class: 'net.nanopay.ui.topNavigation.TopNav' })
          .start('div').addClass('stack-wrapper')
            .tag({class: 'foam.u2.stack.StackView', data: self.stack, showActions: false})
          .end()
          .tag({class: 'net.nanopay.ui.FooterView'});
      });
    },

    function findAccount() {
      var self = this;
      this.clientContext.accountDAO.find(this.user.id).then(function (a) {
        return self.account.copyFrom(a);
      }.bind(this));
    }
  ],

  listeners: [
    function onUserUpdate() {
      this.SUPER();
      this.findAccount();
    }
  ]
});
