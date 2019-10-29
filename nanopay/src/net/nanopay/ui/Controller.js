foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',

  documentation: 'Nanopay Top-Level Application Controller.',

  implements: [
    'foam.mlang.Expressions',
    'net.nanopay.util.AddCommaFormatter',
    'net.nanopay.util.CurrencyFormatter',
    'net.nanopay.util.FormValidation'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.nanos.u2.navigation.FooterView',
    'foam.nanos.u2.navigation.TopNavigation',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.auth.ui.SignInView',
    'net.nanopay.invoice.ui.style.InvoiceStyles',
    'net.nanopay.exchangeable.Currency',
    'net.nanopay.ui.banner.BannerData',
    'net.nanopay.ui.banner.BannerMode',
    'net.nanopay.ui.modal.ModalStyling',
    'net.nanopay.ui.modal.SessionTimeoutModal',
    'net.nanopay.ui.style.AppStyles',
    'net.nanopay.ui.NanoConnectStyles'
  ],

  imports: [
    'digitalAccount',
    'accountDAO',
    'balanceDAO'
  ],

  exports: [
    'appConfig',
    'as ctrl',
    'balance',
    'currentAccount',
    'findAccount',
    'findBalance',
    'privacyUrl',
    'termsUrl',
    'homeDenomination'
  ],

  css: `
    .stack-wrapper {
      /* 70px for topNav || 20px for padding || 40px for footer */
      min-height: calc(100% - 70px - 20px - 40px) !important;
      margin-bottom: 0 !important;
      overflow-x: hidden;
    }
    .stack-wrapper:after {
      content: "";
      display: block;
    }
    .foam-comics-DAOUpdateControllerView .property-transactionLimits .foam-u2-ActionView-addItem {
      height: auto;
      padding: 3px;
      width: auto;
    }

    /*
     * The following CSS is for styling flow documents because they don't have
     * much in terms of default styling.
     * TODO: Consider moving this to a subclass of foam.flow.DocumentView and
     * using the subclass to render flow documents.
     */
    .foam-flow-Document {
      background-color: #ffffff;
      color: #4c555a;
      max-width: 1000px;
      margin: auto;
      padding: 20px;
      line-height: 26px;
      font-size: 14px;
      font-weight: 500;
      -webkit-font-smoothing: antialiased;
    }
    .foam-flow-Document h1 {
      font-weight: 400;
      font-size: 24px;
      line-height: 32px;
    }
    .foam-flow-Document h2 {
      font-weight: 500;
      font-size: 18px;
      line-height: 26px;
    }
    .foam-flow-Document h3 {
      font-weight: 500;
      font-size: 16px;
      line-height: 22px;
    }
    .foam-flow-Document h1,
    .foam-flow-Document h2,
    .foam-flow-Document h3,
    .foam-flow-Document h4,
    .foam-flow-Document h5 {
      margin: 12px 0 0 0;
      color: #292e31;
    }
    .foam-flow-Document p {
      margin-bottom: 0;
      margin-top: 20px;
    }
    .foam-flow-Document .code {
      background-color: black;
      color: white;
      padding: 20px;
    }
    .foam-flow-Document a {
      color: rgb(0, 153, 229);
      text-decoration-line: none;
    }
  `,

  constants: [
    {
      type: 'String',
      name: 'ACCOUNT',
      value: 'account',
    }
  ],

  properties: [
    'privacyUrl',
    'termsUrl',
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.account.Balance',
      name: 'balance',
      factory: function() {
        return this.Balance.create();
      }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.account.Account',
      name: 'currentAccount',
      factory: function() {
        return this.DigitalAccount.create({
          owner: this.user,
          denomination: 'CAD'
        });
      }
    },
    {
      class: 'Reference',
      of: 'net.nanopay.exchangeable.Currency',
      name: 'homeDenomination',
      factory: function() {
        /**
         * TODO: Currently our storing the home denomination preferences, just need it
         * to default to USD for Goldman, also added a hacky way to persist it via local storage
         * we will later on think of a better way to handle default user preferences
         */
        const defaultDenomination = 'USD';
        const storedHomeDenomination = localStorage.getItem('homeDenomination');

        let startingDenomination;
        if ( storedHomeDenomination ) {
          localStorage.setItem('homeDenomination', storedHomeDenomination);
          startingDenomination = storedHomeDenomination;
        } else {
          startingDenomination = defaultDenomination;
        }

        return startingDenomination;
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.ui.banner.BannerData',
      name: 'bannerData',
      factory: function() {
        return this.BannerData.create({
          isDismissed: true
        });
      }
    },
  ],

  methods: [
    function initE() {
      // adding a listener to track the display width here as well since we don't call super
      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();

      // enable session timer
      this.sessionTimer.enable = true;
      this.sessionTimer.onSessionTimeout = this.onSessionTimeout.bind(this);

      // If we don't wait for the Theme object to load then we'll get
      // errors when trying to expand the CSS macros in these models.
      this.clientPromise.then(() => {
        this.fetchTheme().then(() => {
          this.client.nSpecDAO.find('appConfig').then((config) => {
            this.appConfig.copyFrom(config.service);
          });
          this.AppStyles.create();
          this.NanoConnectStyles.create();
          this.InvoiceStyles.create();
          this.ModalStyling.create();

          this.findBalance();
          this
            .addClass(this.myClass())
            .start('div', null, this.topNavigation_$)
              .tag(this.TopNavigation)
            .end()
            .start()
              .addClass('stack-wrapper')
              .tag({
                class: 'net.nanopay.ui.banner.Banner',
                data$: this.bannerData$
              })
              .tag(this.StackView, {
                data: this.stack,
                showActions: false
              })
            .end()
            .start('div', null, this.footerView_$)
              .tag(this.FooterView)
            .end();
        });
      });
    },

    function bannerizeTwoFactorAuth() {
      if ( ! this.user.twoFactorEnabled ) {
        this.setBanner(this.BannerMode.NOTICE, 'Please enable Two-Factor Authentication in Personal Settings.');
      }
    },

    function setBanner(bannerMode, message) {
      this.bannerData.isDismissed = false;
      this.bannerData.mode = bannerMode;
      this.bannerData.message = message;
    },

    function onSessionTimeout() {
      if ( this.user.emailVerified ) {
        this.add(this.Popup.create({ closeable: false }).tag(this.SessionTimeoutModal));
      }
    },

    function findAccount() {
      if ( this.currentAccount == null || this.currentAccount.id == 0 ||
           this.currentAccount.owner != null && this.currentAccount.owner.id != this.user.id ) {
        return this.client.digitalAccount.findDefault(this.client, null).then(function(account) {
          this.currentAccount.copyFrom(account);
          return this.currentAccount;
        }.bind(this));
      } else {
        return this.client.accountDAO.find(this.currentAccount.id).then(function(account) {
          this.currentAccount.copyFrom(account);
          return this.currentAccount;
        }.bind(this));
      }
    },

    function findBalance() {
      return this.findAccount().then(function(account) {
        if ( account != null ) {
          account.findBalance(this.client).then(function(balance) {
          // this.client.balanceDAO.find(account).then(function(balance) {
            return this.balance.copyFrom(balance);
          }.bind(this));
        }
      }.bind(this));
    },

    function requestLogin() {
      var self = this;

      // don't go to log in screen if going to reset password screen
      if ( location.hash != null && location.hash === '#reset' )
        return new Promise(function(resolve, reject) {
          self.stack.push({ class: 'foam.nanos.auth.resetPassword.ResetView' });
          self.loginSuccess$.sub(resolve);
        });

      // don't go to log in screen if going to sign up password screen
      if ( location.hash != null && location.hash === '#sign-up' )
        return new Promise(function(resolve, reject) {
          self.stack.push({ class: 'net.nanopay.auth.ui.SignUpView' });
          self.loginSuccess$.sub(resolve);
        });

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'net.nanopay.auth.ui.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    }
  ],

  listeners: [
    function onUserAgentAndGroupLoaded() {
      // only show B2B onboarding if user is a Business
      if ( this.user.type === 'Business' ) {
        // check account status and show UI accordingly
        switch ( this.user.status ) {
          case this.AccountStatus.PENDING:
            this.loginSuccess = false;
            this.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard' });
            return;

          case this.AccountStatus.SUBMITTED:
            this.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 5 });
            this.loginSuccess = false;
            return;

          case this.AccountStatus.DISABLED:

            // If the user submitted the form before their account was
            // disabled but before it was activated, they should see page
            // 5 of the onboarding wizard to be able to review what they
            // submitted.
            if ( this.user.previousStatus === this.AccountStatus.SUBMITTED ) {
              this.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 5 });

            // Otherwise, if they haven't submitted yet, or were already
            // activated, they shouldn't need to be able to review their
            // submission, so they should just see the simple "account
            // disabled" view.
            } else {
              this.stack.push({ class: 'net.nanopay.admin.ui.AccountRevokedView' });
            }
            this.loginSuccess = false;
            return;

          // show onboarding screen if user hasn't clicked "Go To Portal" button
          case this.AccountStatus.ACTIVE:
            if ( ! this.user.createdPwd ) {
              this.loginSuccess = false;
              this.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 6 });
              return;
            }
            if ( this.user.onboarded ) break;
            this.loginSuccess = false;
            this.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 5 });
            return;

          case this.AccountStatus.REVOKED:
            this.loginSuccess = false;
            this.stack.push({ class: 'net.nanopay.admin.ui.AccountRevokedView' });
            return;
        }
      }

      this.SUPER();
      this.findBalance();

      if ( this.appConfig.mode == foam.nanos.app.Mode.PRODUCTION ) {
        this.bannerizeTwoFactorAuth();
      }
    }
  ]
});
