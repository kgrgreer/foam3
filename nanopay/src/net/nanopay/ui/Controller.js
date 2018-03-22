foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',

  arequire: function() { return foam.nanos.client.ClientBuilder.create(); },

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
    'net.nanopay.invoice.ui.style.InvoiceStyles',
    'net.nanopay.admin.model.AccountStatus'
  ],

  exports: [
    'account',
    'privacyUrl',
    'termsUrl',
    'as ctrl',
    'findAccount',
    'appConfig'
  ],

  css: `
    .stack-wrapper {
      /* 70px for topNav || 20px for padding || 40px for footer */
      min-height: calc(100% - 70px - 20px - 40px) !important;
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
      factory: function() { return this.Account.create(); }
    },
    {
      name: 'appConfig'
    }
  ],

  methods: [
    function initE() {
      this.AppStyles.create();
      this.InvoiceStyles.create();
      this.ModalStyling.create();

      this.nSpecDAO.find('appConfig').then(function(config){
        self.appConfig = config;
      })

      var self = this;
      foam.__context__.register(net.nanopay.ui.ActionView, 'foam.u2.ActionView');

      this.findAccount();

      this
        .addClass(this.myClass())
        .tag({class: 'net.nanopay.ui.topNavigation.TopNav' })
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end()
        .tag({class: 'net.nanopay.ui.FooterView'});
    },

    function getCurrentUser() {
      var self = this;

      // get current user, else show login
      this.auth.getCurrentUser(null).then(function (result) {
        self.loginSuccess = !! result;
        if ( result ) {
          self.user.copyFrom(result);
          // check account status and show UI accordingly
          switch ( self.user.status ) {
            case self.AccountStatus.PENDING:
              self.loginSuccess = false;
              self.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard' });
              return;

            case self.AccountStatus.SUBMITTED:
            case self.AccountStatus.DISABLED:
              self.loginSuccess = false;
              self.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 5 });
              return;

            // show onboarding screen if user hasn't clicked "Go To Portal" button
            case self.AccountStatus.ACTIVE:
              if ( self.user.onboardingComplete ) break;
              self.loginSuccess = false;
              self.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 5 })
              return;

              if ( ! self.user.onboardingComplete ) {
                self.loginSuccess = false;
              }
              break;

            case self.AccountStatus.REVOKED:
              self.loginSuccess = false;
              self.stack.push({ class: 'net.nanopay.admin.ui.AccountRevokedView' });
              return;
          }

          // check if user email verified
          if ( ! self.user.emailVerified ) {
            self.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
            return;
          }

          self.onUserUpdate();
        }
      })
      .catch(function (err) {
        self.requestLogin().then(function () {
          self.getCurrentUser();
        });
      });
    },

    function findAccount() {
      var self = this;
      this.accountDAO.find(this.user.id).then(function (a) {
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
