foam.CLASS({
  package: 'net.nanopay.sme',
  name: 'SMEController',
  extends: 'net.nanopay.ui.Controller',

  documentation: 'SME Top-Level Application Controller.',

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',
    'net.nanopay.model.Business',
    'net.nanopay.sme.ui.banner.ComplianceBannerData',
    'net.nanopay.sme.ui.banner.ComplianceBannerMode',
    'net.nanopay.sme.ui.ChangePasswordView',
    'net.nanopay.sme.ui.ResendPasswordView',
    'net.nanopay.sme.ui.ResetPasswordView',
    'net.nanopay.sme.ui.SMEModal',
    'net.nanopay.sme.ui.SMEStyles',
    'net.nanopay.sme.ui.SMEWizardOverview',
    'net.nanopay.sme.ui.SuccessPasswordView',
    'net.nanopay.sme.ui.ToastNotification as NotificationMessage',
    'net.nanopay.sme.ui.TwoFactorSignInView',
    'net.nanopay.sme.ui.VerifyEmail'
  ],

  exports: [
    'agent',
    'appConfig',
    'as ctrl',
    'balance',
    'bannerData',
    'bannerizeCompliance',
    'checkComplianceAndBanking',
    'currentAccount',
    'findAccount',
    'findBalance',
    'privacyUrl',
    'termsUrl'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  css: `
  ^ .foam-u2-view-TableView tbody > tr > td {
    white-space: nowrap;
    max-width: 280px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-auth-ui-UserSelectionView .styleHolder_NameField {
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-auth-ui-UserSelectionView .styleHolder_EmailField {
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-sme-ui-InvoiceDetails .medium-header {
    overflow: hidden;
    white-space: nowrap;
    max-width: 300px;
    text-overflow: ellipsis;
  }
  /* InvoiceOverview Header format length */
  ^ .x-large-header {
    overflow: hidden;
    white-space: nowrap;
    max-width: 600px;
    text-overflow: ellipsis;
  }
  /* Side Menu Name format length */
  ^ .net-nanopay-sme-ui-SideNavigationView .account-button-info-detail {
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-sme-ui-SideNavigationView .account-button-info-detail-small {
    overflow: hidden;
    white-space: nowrap;
    max-width: 200px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-sme-ui-CompanyInformationView .table-content {
    overflow: hidden;
    white-space: nowrap;
    max-width: 240px;
    text-overflow: ellipsis;
  }
  ^ .net-nanopay-sme-ui-AddUserToBusinessModal .medium-header {
    overflow: hidden;
    white-space: nowrap;
    max-width: 450px;
    text-overflow: ellipsis;
  }
  `,

  messages: [
    {
      name: 'REQUESTED_BANNER',
      message: 'We\'re currently reviewing your business profile to enable payments. This typically takes 2-3 business days.'
    },
    {
      name: 'PASSED_BANNER',
      message: 'Congratulations! Your business is now fully verified and ready to make domestic and cross-border payments!'
    },
    {
      name: 'INCOMPLETE_BUSINESS_REGISTRATION',
      message: `You must complete your business profile and add banking first.`
    },
    {
      name: 'HAS_NOT_PASSED_COMPLIANCE',
      message: `Our team is reviewing your account. Once it is approved, you can complete this action.`
    },
    {
      name: 'QUERY_BANK_AMOUNT_ERROR',
      message: 'An unexpected error occurred while counting the number of bank accounts the user has: '
    }
  ],

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'agent',
      documentation: `
        If a user acts as a Business, this will be set to the user acting as
        the business.
      `
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'net.nanopay.model.Business',
      name: 'user',
      factory: function() {
        return this.Business.create({});
      },
      documentation: `
        If a user acts as a Business, this will be set to the Business.
      `
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.sme.ui.banner.ComplianceBannerData',
      name: 'bannerData',
      factory: function() {
        return this.ComplianceBannerData.create({
          isDismissed: true
        });
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();
      var self = this;

      // enable session timer
      this.sessionTimer.enable = true;
      this.sessionTimer.onSessionTimeout = this.onSessionTimeout.bind(this);

      self.clientPromise.then(function(client) {
        self.setPrivate_('__subContext__', client.__subContext__);
        self.getCurrentUser();

        window.onpopstate = function(event) {
          if ( location.hash != null ) {
            // Redirect user to switch business if agent doesn't exist.
            if ( ! self.agent && location.hash !== '' ) {
              self.client.menuDAO.find('sme.accountProfile.switch-business')
                .then(function(menu) {
                  menu.launch();
                });
            } else {
              var hash = location.hash.substr(1);
              if ( hash !== '' ) {
                self.client.menuDAO.find(hash).then((menu) => {
                  // Any errors in finding the menu location to redirect
                  // will result in a redirect to dashboard.
                  if ( menu ) {
                    menu.launch();
                  } else {
                    self.pushMenu('sme.main.dashboard');
                  }
                });
              }
            }
          }
        };
      });
    },

    function onSessionTimeout() {
      this.add(this.Popup.create({ closeable: false }).tag({
        class: 'net.nanopay.ui.modal.SessionTimeoutModal',
      }));
    },

    function initE() {
      var self = this;

      self.clientPromise.then(function() {
        self.client.nSpecDAO.find('appConfig').then(function(config) {
          self.appConfig.copyFrom(config.service);
        });
        self.getCurrentAgent();

        self.AppStyles.create();
        self.SMEStyles.create();
        self.InvoiceStyles.create();
        self.ModalStyling.create();

        // TODO & NOTE: This is a workaround. This prevents the CSS from breaking when viewing it in a subclass first before the parent class.
        self.BankPadAuthorization.create();

        self.__subContext__.register(self.ActionView, 'foam.u2.ActionView');
        self.__subContext__.register(self.SMEWizardOverview, 'net.nanopay.ui.wizard.WizardOverview');
        self.__subContext__.register(self.SMEModal, 'foam.u2.dialog.Popup');
        self.__subContext__.register(self.ResetPasswordView, 'foam.nanos.auth.resetPassword.EmailView');
        self.__subContext__.register(self.ResendPasswordView, 'foam.nanos.auth.resetPassword.ResendView');
        self.__subContext__.register(self.ChangePasswordView, 'foam.nanos.auth.resetPassword.ResetView');
        self.__subContext__.register(self.SuccessPasswordView, 'foam.nanos.auth.resetPassword.SuccessView');
        self.__subContext__.register(self.VerifyEmail, 'foam.nanos.auth.ResendVerificationEmail');
        self.__subContext__.register(self.ToastNotification, 'foam.u2.dialog.NotificationMessage');
        self.__subContext__.register(self.TwoFactorSignInView, 'foam.nanos.auth.twofactor.TwoFactorSignInView');

        self.findBalance();
        self.addClass(self.myClass())
          .tag('div', null, self.topNavigation_$)
          .start()
            .addClass('stack-wrapper')
            .start({
              class: 'net.nanopay.sme.ui.banner.ComplianceBanner',
              data$: self.bannerData$
            })
            .end()
            .tag({
              class: 'foam.u2.stack.StackView',
              data: self.stack,
              showActions: false
            })
          .end()
          .tag('div', null, self.footerView_$);

          /*
            This is mandatory.
            'topNavigation_' & 'footerView' need empty view when initialize,
            otherwise they won't toggle after signin.
          */
          self.topNavigation_.add(foam.u2.View.create());
          self.footerView_.hide();
      });
    },

    async function requestLogin() {
      var self = this;
      var searchParams;
      var locHash = location.hash;

      if ( locHash ) {
        // don't go to log in screen if going to reset password screen
        if ( locHash === '#reset' ) {
          return new Promise(function(resolve, reject) {
            // TODO SME specific
            self.stack.push({ class: 'foam.nanos.auth.resetPassword.ResetView' });
            self.loginSuccess$.sub(resolve);
          });
        }
        searchParams = new URLSearchParams(location.search);
        // don't go to log in screen if going to sign up password screen
        if ( locHash === '#sign-up' && ! self.loginSuccess ) {
          return new Promise(function(resolve, reject) {
            self.stack.push({
              class: 'net.nanopay.sme.ui.SignUpView',
              emailField: searchParams.get('email'),
              disableEmail: true,
              signUpToken: searchParams.get('token'),
              companyNameField: searchParams.has('companyName') ? searchParams.get('companyName'): '',
              disableCompanyName: searchParams.has('companyName')
            });
            self.loginSuccess$.sub(resolve);
          });
        }

        // Situation where redirect is from adding an existing user to a business
        if ( locHash === '#sign-in' ) {
          return new Promise(function(resolve, reject) {
            self.stack.push({
              class: 'net.nanopay.sme.ui.SignInView',
              email: searchParams.get('email'),
              disableEmail: true,
              signUpToken: searchParams.get('token'),
            });
            self.loginSuccess$.sub(resolve);
          });
        }
      }

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'net.nanopay.sme.ui.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    },

    function getCurrentUser() {
      var self = this;
      // get current user, else show login
      this.client.auth.getCurrentUser(null).then(function(result) {
        self.loginSuccess = !! result;
        if ( result ) {
          foam.assert(self.user.id === result.id, `The user that was returned from 'getCurrentUser's id must be the same as the user's id returned from 'loginByEmail'. If this isn't happening, it's possible that one of those methods is returning the wrong user.`);

          self.user.copyFrom(result);

          // If the user's email isn't verified, send them to the "verify email"
          // screen.
          if ( ! self.user.emailVerified ) {
            self.loginSuccess = false;
            self.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
            return;
          }

          self.onUserUpdate();
          self.bannerizeCompliance();
        }
      })
      .catch(function(err) {
        self.requestLogin().then(function() {
          self.getCurrentUser();
        });
      });
    },

    function getCurrentAgent() {
      var self = this;
      // get current user, else show login
      this.client.agentAuth.getCurrentAgent(this).then(function(result) {
        if ( result ) {
          self.agent = result;

          self.onUserUpdate();
        }
      }).catch(function(err) {
        self.requestLogin().then(function() {
          self.getCurrentUser();
        });
      });
    },

    function bannerizeCompliance() {
      switch ( this.user.compliance ) {
        case this.ComplianceStatus.NOTREQUESTED:
          break;
        case this.ComplianceStatus.REQUESTED:
          this.bannerData.isDismissed = false;
          this.bannerData.mode = this.ComplianceBannerMode.NOTICE;
          this.bannerData.message = this.REQUESTED_BANNER;
          break;
        case this.ComplianceStatus.PASSED:
          this.bannerData.isDismissed = false;
          this.bannerData.mode = this.ComplianceBannerMode.ACCOMPLISHED;
          this.bannerData.message = this.PASSED_BANNER;
          break;
        default:
          this.bannerData.isDismissed = true;
          break;
      }
    },

    async function checkComplianceAndBanking() {
      var bankAccountCount = await this.bankingAmount();

      if ( this.user.compliance !== this.ComplianceStatus.PASSED
           || bankAccountCount === 0 ) {
        if ( this.user.onboarded && bankAccountCount !== 0 ) {
          this.notify(this.HAS_NOT_PASSED_COMPLIANCE, 'error');
        } else {
          this.notify(this.INCOMPLETE_BUSINESS_REGISTRATION, 'error');
        }
        return false;
      }
      return true;
    },

    /**
     * Returns a promise that resolves to the number of bank accounts that the
     * user owns.
     */
    async function bankingAmount() {
      try {
        return (await this.user.accounts
          .where(this.OR(
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          ))
          .select(this.COUNT())).value;
      } catch (err) {
        console.warn(this.QUERY_BANK_AMOUNT_ERROR, err);
      }
    }
  ]
});
