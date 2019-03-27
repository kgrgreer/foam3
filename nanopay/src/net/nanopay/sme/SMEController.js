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
    'bannerData',
    'bannerizeCompliance',
    'checkComplianceAndBanking',
    'currentAccount',
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

      // Enable session timer.
      this.sessionTimer.enable = true;
      this.sessionTimer.onSessionTimeout = this.onSessionTimeout.bind(this);

      window.onpopstate = async (event) => {
        var menu;

        // Redirect user to switch business if agent doesn't exist.
        if ( ! this.agent ) {
          menu = await this.client.menuDAO.find('sme.accountProfile.switch-business');
          menu.launch(this);
          return;
        }

        var hash = location.hash.substr(1);
        menu = await this.client.menuDAO.find(hash);

        // Any errors in finding the menu location to redirect
        // will result in a redirect to dashboard.
        if ( menu ) {
          menu.launch(this);
        } else {
          this.confirmHashRedirectIfInvitedAndSignedIn();
        }
      };
    },

    function onSessionTimeout() {
      this.add(this.SMEModal.create({ closeable: false }).tag({
        class: 'net.nanopay.ui.modal.SessionTimeoutModal',
      }));
    },

    function initE() {
      var self = this;

      self.clientPromise.then(function() {
        self.client.nSpecDAO.find('appConfig').then(function(config) {
          self.appConfig.copyFrom(config.service);
        });
        self.fetchAgent();

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
        self.__subContext__.register(self.NotificationMessage, 'foam.u2.dialog.NotificationMessage');
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

    function requestLogin() {
      var self = this;
      var locHash = location.hash;
      var view = { class: 'net.nanopay.sme.ui.SignInView' };

      if ( locHash ) {
        // Don't go to log in screen if going to reset password screen.
        if ( locHash === '#reset' ) {
          view = { class: 'foam.nanos.auth.resetPassword.ResetView' };
        }

        var searchParams = new URLSearchParams(location.search);

        // Don't go to log in screen if going to sign up password screen.
        if ( locHash === '#sign-up' && ! self.loginSuccess ) {
          view = {
            class: 'net.nanopay.sme.ui.SignUpView',
            emailField: searchParams.get('email'),
            disableEmail: true,
            signUpToken: searchParams.get('token'),
            companyNameField: searchParams.has('companyName')
              ? searchParams.get('companyName')
              : '',
            disableCompanyName: searchParams.has('companyName')
          };
        }

        // Situation where redirect is from adding an existing user to a
        // business.
        if ( locHash === '#invited' && ! self.loginSuccess ) {
          view = {
            class: 'net.nanopay.sme.ui.SignInView',
            email: searchParams.get('email'),
            disableEmail: true,
            signUpToken: searchParams.get('token'),
          };
        }
      }

      return new Promise(function(resolve, reject) {
        self.stack.push(view);
        self.loginSuccess$.sub(resolve);
      });
    },

    // FIXME: This whole thing needs to be looked at.
    function confirmHashRedirectIfInvitedAndSignedIn() {
      var locHash = location.hash;
      var searchParams = new URLSearchParams(location.search);
      if ( locHash === '#invited' && this.loginSuccess ) {
        var dao = ctrl.__subContext__.smeBusinessRegistrationDAO;
        if ( dao ) {
          this.agent.signUpToken = searchParams.get('token');
          var userr = dao.put(this.agent);
          if ( userr ) {
            this.agent.copyFrom(userr);
            ctrl.notify(`Success you are now apart of a new business: ${searchParams.get('companyName')}`);
            // replace url parameters with 'ablii' and redirect to dashboard, effectively riding the token of url history
            history.replaceState({}, '', 'ablii');
            this.pushMenu('sme.main.dashboard');
          } else {
            ctrl.notify(err.message || `The invitation to a business ${searchParams.get('companyName')} was not processed, please try again.`, 'error');
            // replace url parameters with 'ablii' and redirect to dashboard, effectively riding the token of url history
            history.replaceState({}, '', 'ablii');
            this.pushMenu('sme.main.dashboard');
          }
        }
      }
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
  ],

  listeners: [
    function onUserLoad() {
      if ( ! this.user.emailVerified ) {
        this.loginSuccess = false;
        this.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
      }

      this.bannerizeCompliance();
    }
  ]
});
