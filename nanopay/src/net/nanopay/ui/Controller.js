foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'Controller',
  extends: 'foam.nanos.controller.ApplicationController',

  documentation: 'Nanopay/Ablii Top-Level Application Controller.',

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
    'foam.core.Currency',
    'foam.core.Latch',
    'foam.u2.Element',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.accounting.AccountingIntegrationUtil',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',
    'net.nanopay.invoice.ui.style.InvoiceStyles',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction',
    'net.nanopay.model.SignUp',
    'net.nanopay.sme.ui.AbliiActionView',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.sme.ui.AbliiOverlayActionListView',
    'net.nanopay.sme.ui.SMEModal',
    'net.nanopay.sme.ui.SMEStyles',
    'net.nanopay.sme.ui.SMEWizardOverview',
    'net.nanopay.sme.ui.SuccessPasswordView',
    'net.nanopay.sme.ui.ToastNotification as NotificationMessage',
    'net.nanopay.sme.ui.TwoFactorSignInView',
    'net.nanopay.sme.ui.VerifyEmailView',
    'net.nanopay.ui.banner.BannerData',
    'net.nanopay.ui.banner.BannerMode',
    'net.nanopay.ui.ConnectSubMenu',
    'net.nanopay.ui.modal.ModalStyling',
    'net.nanopay.ui.modal.SessionTimeoutModal',
    'net.nanopay.ui.style.AppStyles',
    'net.nanopay.util.OnboardingUtil'
  ],

  imports: [
    'canadaUsBusinessOnboardingDAO',
    'digitalAccount',
    'accountDAO',
    'balanceDAO'
  ],

  exports: [
    'accountingIntegrationUtil',
    'appConfig',
    'as ctrl',
    'balance',
    'bannerData',
    'bannerizeCompliance',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'currentAccount',
    'findAccount',
    'findBalance',
    'homeDenomination',
    'isIframe',
    'onboardingUtil',
    'privacyUrl',
    'sme',
    'termsUrl',
    'userLoggedIn'
  ],

  css: `
    ^ {
      height: 100%;
    }
    .stack-wrapper {
      flex-grow: 1;
      /* 70px for topNav || 20px for padding || 40px for footer */
      min-height: calc(100% - 70px - 20px - 40px) !important;
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

  messages: [
    {
      name: 'COMPLIANCE_NOT_REQUESTED_NO_BANK',
      message: 'Please complete your business profile and add a bank account.'
    },
    {
      name: 'COMPLIANCE_NOT_REQUESTED_BANK_NEED_VERIFY',
      message: 'Please verify your bank account and complete your business profile to submit your account for review.'
    },
    {
      name: 'COMPLIANCE_NOT_REQUESTED_BANK_VERIFIED',
      message: 'Please complete your business profile to submit your account for review.'
    },
    {
      name: 'COMPLIANCE_REQUESTED_NO_BANK',
      message: 'Please add a bank account to submit your account for review.'
    },
    {
      name: 'COMPLIANCE_REQUESTED_BANK_NEED_VERIFY',
      message: 'Please verify your bank account to submit your account for review.'
    },
    {
      name: 'COMPLIANCE_PASSED_NO_BANK',
      message: 'Please add a bank account.'
    },
    {
      name: 'COMPLIANCE_PASSED_BANK_NEED_VERIFY',
      message: 'Please verify your bank account.'
    },
    {
      name: 'BUSINESS_INFO_UNDER_REVIEW',
      message: 'Our compliance team is reviewing the information you have submitted. Your account will be updated in 1-3 business days.'
    },
    {
      name: 'PASSED_BANNER',
      message: 'Congratulations, your business is now fully verified! You\'re now ready to make domestic payments!'
    },
    {
      name: 'PASSED_BANNER_DOMESTIC_US',
      message: 'Congratulations, your business is now fully verified! You\'re now ready to send and receive payments between Canada and the US!'
    },
    {
      name: 'PASSED_BANNER_INTERNATIONAL',
      message: 'Congratulations, your business is now fully verified! You\'re now ready to make domestic and international payments to USA!'
    },
    {
      name: 'TWO_FACTOR_REQUIRED_ONE',
      message: 'For your security, two factor authentication is required to send payment.'
    },
    {
      name: 'TWO_FACTOR_REQUIRED_TWO',
      message: 'Click here to set up.'
    },
    {
      name: 'HAS_NOT_PASSED_COMPLIANCE',
      message: `Our team is reviewing your account. Once it is approved, you can complete this action.`
    },
    {
      name: 'QUERY_BANK_AMOUNT_ERROR',
      message: 'An unexpected error occurred while counting the number of bank accounts the user has: '
    },
    {
      name: 'ADDED_TO_BUSINESS_1',
      message: `You've been successfully added to `
    },
    {
      name: 'ADDED_TO_BUSINESS_2',
      message: '. Welcome to Ablii!'
    },
    {
      name: 'ABILITY_TO_PAY_ERROR',
      message: 'Error occurred when checking the ability to send payment'
    },
    {
      name: 'ABILITY_TO_RECEIVE_ERROR',
      message: 'Error occurred when checking the ability to receive payment'
    },
    {
      name: 'FETCH_MENU_ERROR',
      message: 'Error occurred when fetching menu'
    },
    {
      name: 'QUERY_SIGNING_OFFICERS_ERROR',
      message: 'An unexpected error occurred while querying signing officers: '
    },
    {
      name: 'SELECT_BUSINESS_WARNING',
      message: 'Please select a business before proceeding'
    },
    {
      name: 'INVALID_TOKEN_ERROR_TITLE',
      message: 'We’re Sorry'
    },
    {
      name: 'INVALID_TOKEN_ERROR_1',
      message: 'It looks like you’re trying to accept an invitation, but the invitation has been revoked.'
    },
    {
      name: 'INVALID_TOKEN_ERROR_2',
      message: 'If you feel you’ve reached this message in error, please contact your Company Administrator.'
    }
  ],

  constants: [
    {
      type: 'String',
      name: 'ACCOUNT',
      value: 'account',
    }
  ],

  properties: [
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.Latch',
      name: 'themeInstalled',
      documentation: 'A latch used to wait on theme installation.',
      factory: function() {
        return this.Latch.create();
      }
    },
    {
      class: 'foam.core.FObjectProperty',
      of: 'foam.core.Latch',
      name: 'userLoggedIn',
      documentation: 'A latch used to wait on user login.',
      factory: function() {
        return this.Latch.create();
      }
    },
    {
      name: 'loginVariables',
      expression: function( client$smeBusinessRegistrationDAO ) {
        return {
          dao_: client$smeBusinessRegistrationDAO || null,
          imgPath: this.theme.loginImage,
          group_: 'sme',
          countryChoices_: ['CA', 'US']
        };
      }
    },
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
          owner: this.subject.user,
          denomination: 'CAD'
        });
      }
    },
    {
      class: 'Reference',
      of: 'foam.core.Currency',
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
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.accounting.AccountingIntegrationUtil',
      name: 'accountingIntegrationUtil',
      factory: function() {
        return this.AccountingIntegrationUtil.create();
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.util.OnboardingUtil',
      name: 'onboardingUtil',
      factory: function() {
        return this.OnboardingUtil.create();
      }
    },
    {
      class: 'Boolean',
      name: 'caUsOnboardingComplete'
    },
    {
      class: 'Boolean',
      name: 'verifiedAccount'
    },
    {
      documentation: 'true when User Group is part of SME',
      class: 'Boolean',
      name: 'sme',
      value: false
    },
    {
      class: 'Array',
      name: 'complianceStatusArray',
      documentation: `
        A customized array contains objects for the toast notification
        and banner to handle different cases of the business onboarding status
        and the bank account status.
      `,
      factory: function() {
        var self = this;
        return [
          {
            msg: this.COMPLIANCE_NOT_REQUESTED_NO_BANK,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.NOTREQUESTED
                && accountArray.length === 0;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_NOT_REQUESTED_BANK_NEED_VERIFY,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.NOTREQUESTED
                && ! verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_NOT_REQUESTED_BANK_VERIFIED,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.NOTREQUESTED
                && verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_REQUESTED_NO_BANK,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray) {
              return user.compliance === self.ComplianceStatus.REQUESTED
                && accountArray.length === 0;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_REQUESTED_BANK_NEED_VERIFY,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.REQUESTED
                && ! verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_PASSED_NO_BANK,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray) {
              return accountArray.length === 0
                && user.compliance === self.ComplianceStatus.PASSED;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.COMPLIANCE_PASSED_BANK_NEED_VERIFY,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.PASSED
                && ! verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.BUSINESS_INFO_UNDER_REVIEW,
            bannerMode: this.BannerMode.NOTICE,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.REQUESTED
                && verifiedAccount;
            },
            passed: false,
            showBanner: true
          },
          {
            msg: this.PASSED_BANNER,
            bannerMode: this.BannerMode.ACCOMPLISHED,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
              && user.compliance === self.ComplianceStatus.PASSED
              && verifiedAccount
              && user.address.countryId === 'CA'
              && ! self.caUsOnboardingComplete;
            },
            passed: true,
            showBanner: true
          },
          {
            msg: this.PASSED_BANNER_INTERNATIONAL,
            bannerMode: this.BannerMode.ACCOMPLISHED,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
              && user.compliance === self.ComplianceStatus.PASSED
              && verifiedAccount
              && user.address.countryId === 'CA'
              && self.caUsOnboardingComplete;
            },
            passed: true,
            showBanner: true
          },
          {
            msg: this.PASSED_BANNER_DOMESTIC_US,
            bannerMode: this.BannerMode.ACCOMPLISHED,
            condition: function(user, accountArray, verifiedAccount) {
              return accountArray.length > 0
                && user.compliance === self.ComplianceStatus.PASSED
                && verifiedAccount
                && user.address.countryId === 'US';
            },
            passed: true,
            showBanner: true
          }
        ];
      }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      // Enable session timer.
      this.sessionTimer.enable = true;
      this.sessionTimer.onSessionTimeout = this.onSessionTimeout.bind(this);
    },

    async function initE() {
      // adding a listener to track the display width here as well since we don't call super
      window.addEventListener('resize', this.updateDisplayWidth);
      this.updateDisplayWidth();
  
      // If we don't wait for the Theme object to load then we'll get
      // errors when trying to expand the CSS macros in these models.
      await this.clientPromise;
      await this.fetchTheme();

      this.client.nSpecDAO.find('appConfig').then((config) => {
        this.appConfig.copyFrom(config.service);

        this.AppStyles.create();
        this.InvoiceStyles.create();
        this.ModalStyling.create();

        this.SMEStyles.create();

        // TODO & NOTE: This is a workaround. This prevents the CSS from breaking when viewing it in a subclass first before the parent class.
        this.BankPadAuthorization.create();

        this.__subContext__.register(this.AbliiActionView, 'foam.u2.ActionView');
        this.__subContext__.register(this.ConnectSubMenu, 'foam.nanos.menu.SubMenu');
        this.__subContext__.register(this.SMEWizardOverview, 'net.nanopay.ui.wizard.WizardOverview');
        this.__subContext__.register(this.SMEModal, 'foam.u2.dialog.Popup');
        this.__subContext__.register(this.SuccessPasswordView, 'foam.nanos.auth.resetPassword.SuccessView');
        this.__subContext__.register(this.VerifyEmailView, 'foam.nanos.auth.ResendVerificationEmail');
        this.__subContext__.register(this.NotificationMessage, 'foam.u2.dialog.NotificationMessage');
        this.__subContext__.register(this.TwoFactorSignInView, 'foam.nanos.auth.twofactor.TwoFactorSignInView');
        this.__subContext__.register(this.AbliiOverlayActionListView, 'foam.u2.view.OverlayActionListView');
        this.__subContext__.register(this.SignUp, 'foam.nanos.u2.navigation.SignUp');

        this.themeInstalled.resolve();
      });

      await this.themeInstalled;

      if ( ! this.isIframe() ){
        this
          .addClass(this.myClass())
          .add(this.slot(function (loginSuccess, topNavigation_) {
            if ( ! loginSuccess ) return null;
            return this.E().tag(topNavigation_);
          }))
          .start()
            .addClass('stack-wrapper')
            .addClass(this.slot(function (loginSuccess) {
              return ! loginSuccess ? 'login-stack' : 'dashboard-stack';
            }))
            .enableClass('login-wrapper', this.loginSuccess$)
            .tag({
              class: 'net.nanopay.ui.banner.Banner',
              data$: this.bannerData$
            })
            .tag(this.StackView, {
              data: this.stack,
              showActions: false
            })
          .end()
          .start()
            .enableClass('footer-wrapper', this.loginSuccess$)
            .add(this.slot(function (footerView_) {
              return this.E().tag(footerView_);
            }))
          .end();
      } else {
        this
          .addClass(this.myClass())
          .start()
            .addClass('stack-wrapper')
            .enableClass('login-wrapper', this.loginSuccess$)
            .tag({
              class: 'net.nanopay.ui.banner.Banner',
              data$: this.bannerData$
            })
            .tag(this.StackView, {
              data: this.stack,
              showActions: false
            })
          .end();
      }
    },

    async function fetchGroup() {
      await this.SUPER();
      if ( this.group ) {
        if ( await this.group.isDescendantOf('sme', this.client.groupDAO) ) {
          this.sme = true;
        }
      }
    },

    function bannerizeTwoFactorAuth() {
      if ( ! this.subject.user.twoFactorEnabled ) {
        this.setBanner(this.BannerMode.NOTICE, 'Please enable Two-Factor Authentication in Personal Settings.');
      }
    },

    function setBanner(bannerMode, message) {
      this.bannerData.isDismissed = false;
      this.bannerData.mode = bannerMode;
      this.bannerData.message = message;
    },

    function onSessionTimeout() {
      if ( (this.subject && this.subject.user && this.subject.user.emailVerified) ||
           (this.subject && this.subject.realUser && this.subject.realUser.emailVerified) ) {
        this.add(this.Popup.create({ closeable: false }).tag(this.SessionTimeoutModal));
      }
    },

    function findAccount() {
      if ( this.currentAccount == null || this.currentAccount.id == 0 ||
           this.currentAccount.owner != null && this.currentAccount.owner.id != this.subject.user.id ) {
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

    async function requestLogin() {
      var self = this;
      var locHash = location.hash;
      var view = { class: 'foam.u2.view.LoginView', mode_: 'SignIn' };

      await this.themeInstalled;

      if ( locHash ) {
        var searchParams = new URLSearchParams(location.search);
        var tokenParam = searchParams.get('token');

        // direct to error page if an invalid token hits (token not found)
        if ( tokenParam ) {
          self.client.authenticationTokenService.processToken(null, null, tokenParam).then(() => {
          }).catch(e => {
            if ( tokenParam != null && e.message === 'Token not found' ) {
              view = net.nanopay.sme.ui.ErrorPageView.create({
                title: this.INVALID_TOKEN_ERROR_TITLE,
                info_1: this.INVALID_TOKEN_ERROR_1,
                info_2: this.INVALID_TOKEN_ERROR_2
              });
              self.stack.push(view, self);
            }
          });

          // Process auth token
          if ( ! self.loginSuccess && !! tokenParam ) {
            self.client.authenticationTokenService.processToken(null, null, tokenParam)
              .then(() => {
                location = locHash == '#onboarding' ? '/' : '/' + locHash;
              });
          }
        }
      }

      // don't go to log in screen if going to reset password screen
      if ( location.hash && location.hash === '#reset' ) {
        view = {
          class: 'foam.nanos.auth.ChangePasswordView',
          modelOf: 'foam.nanos.auth.ResetPassword'
        };
      }
      // don't go to log in screen if going to sign up password screen
      if ( location.hash && location.hash === '#sign-up' && ! self.loginSuccess ) {
        view = {
          class: 'foam.u2.view.LoginView',
          mode_: 'SignUp',
          param: {
            token_: tokenParam,
            email: searchParams.get('email'),
            disableEmail_: searchParams.has('email'),
            disableCompanyName_: searchParams.has('companyName'),
            organization: searchParams.has('companyName') ? searchParams.get('companyName') : '',
            countryChoices_: searchParams.has('country') ? [searchParams.get('country')] : ['CA', 'US'],
            firstName: searchParams.has('firstName') ? searchParams.get('firstName') : '',
            lastName: searchParams.has('lastName') ? searchParams.get('lastName') : '',
            jobTitle: searchParams.has('jobTitle') ? searchParams.get('jobTitle') : '',
            phone: searchParams.has('phone') ? searchParams.get('phone') : ''
          }
        };
      }
      return new Promise(function(resolve, reject) {
        self.stack.push(view, self);
        self.loginSuccess$.sub(resolve);
      });
    },

    /**
     * This function is to set up the banner based on the condition of
     * business onboarding status and bank account status.
     */
    async function bannerizeCompliance() {
      var user = await this.client.userDAO.find(this.subject.user.id);
      var accountArray = await this.getBankAccountArray();
      if ( accountArray ) {
        for ( i =0; i < accountArray.length; i++ ) {
          if ( accountArray[i].status == this.BankAccountStatus.VERIFIED ) {
            this.verifiedAccount = true;
          }
        }
      }
      await this.getCAUSPaymentEnabled(user, this.subject.realUser);

      if ( user.compliance == this.ComplianceStatus.PASSED ) {
        var signingOfficers = await this.getSigningOfficersArray(user);
        this.coalesceUserAndSigningOfficersCompliance(user, signingOfficers);
      }

      /*
       * Get the complianceStatus object from the complianceStatusArray
       * when it matches the condition of business onboarding status
       * and bank account status, also when showBanner is true.
       */
      var bannerElement = this.complianceStatusArray.find((complianceStatus) => {
        return complianceStatus.condition(user, accountArray, this.verifiedAccount) && complianceStatus.showBanner;
      });

      if ( bannerElement ) {
        this.setBanner(bannerElement.bannerMode, bannerElement.msg);
      }
    },

    async function checkComplianceAndBanking() {
      var user = await this.client.userDAO.find(this.subject.user.id);
      var accountArray = await this.getBankAccountArray();

      if ( user.compliance == this.ComplianceStatus.PASSED ) {
        var signingOfficers = await this.getSigningOfficersArray(user);
        this.coalesceUserAndSigningOfficersCompliance(user, signingOfficers);
      }

      if ( accountArray ) {
        for ( i =0; i < accountArray.length; i++ ) {
          if ( accountArray[i].status == this.BankAccountStatus.VERIFIED ) {
            this.verifiedAccount = true;
          }
        }
      }

      var toastElement = this.complianceStatusArray.find((complianceStatus) => {
        return complianceStatus.condition(user, accountArray, this.verifiedAccount);
      });

      if ( toastElement ) {
        if ( ! toastElement.passed ) {
          this.notify(toastElement.msg, 'warning');
        }
        return toastElement.passed;
      } else {
        return false;
      }
    },

    /**
     * This function is to check if the user enable the 2FA when the user
     * have the permission to send a payable.
     * It is only required for payables.
     */
    async function check2FAEnalbed() {
      var canPayInvoice = await this.client.auth.check(null, 'invoice.pay');

      if ( canPayInvoice && ! this.subject.realUser.twoFactorEnabled ) {
        var TwoFactorNotificationDOM = this.Element.create()
          .start().style({ 'display': 'inline-block' })
            .add(this.TWO_FACTOR_REQUIRED_ONE)
          .end()
          .start('a').addClass('toast-link')
            .add(this.TWO_FACTOR_REQUIRED_TWO)
            .on('click', () => {
              this.pushMenu('sme.accountProfile.personal-settings');
            })
          .end();

        // Pass the customized DOM element into the toast notification
        this.notify(TwoFactorNotificationDOM, 'warning');
        if ( this.appConfig.mode != foam.nanos.app.Mode.PRODUCTION ) {
          return true;
        } else {
          return false;
        }
      }
      return true;
    },

    async function checkAndNotifyAbilityToPay() {
      try {
        var result = await this.checkComplianceAndBanking();
        return result ? await this.check2FAEnalbed() : result;
      } catch (err) {
        console.warn(`${this.ABILITY_TO_PAY_ERROR}: `, err);
        this.notify(`${this.ABILITY_TO_PAY_ERROR}.`, 'error');
      }
    },

    async function checkAndNotifyAbilityToReceive() {
      try {
        return await this.checkComplianceAndBanking();
      } catch (err) {
        console.warn(`${this.ABILITY_TO_RECEIVE_ERROR}: `, err);
        this.notify(`${this.ABILITY_TO_RECEIVE_ERROR}.`, 'error');
      }
    },

    /**
     * Returns an array containing all the Canadian and US bank accounts
     * that user owns.
     */
    async function getBankAccountArray() {
      try {
        return (await this.subject.user.accounts
          .where(this.OR(
            this.EQ(this.Account.TYPE, this.CABankAccount.name),
            this.EQ(this.Account.TYPE, this.USBankAccount.name)
          ))
          .select()).array;
      } catch (err) {
        console.warn(this.QUERY_BANK_AMOUNT_ERROR, err);
      }
    },

    /**
     * Returns an array containing all signing officers of the business.
     */
    async function getSigningOfficersArray(user) {
      if ( this.Business.isInstance(user) ) {
        try {
          return (await user.signingOfficers.junctionDAO.where(
            this.EQ(this.BusinessUserJunction.SOURCE_ID, user.id)).select()
          ).array;
        } catch (err) {
          console.warn(this.QUERY_SIGNING_OFFICERS_ERROR, err);
        }
      }
    },

    /**
     * Set caUsOnboardingComplete based on CA/US oboarding status.
     */
    async function getCAUSPaymentEnabled(user, realUser) {
      if ( this.Business.isInstance(user) ) {
        this.__subSubContext__.canadaUsBusinessOnboardingDAO.find(
          this.AND(
            this.EQ(this.CanadaUsBusinessOnboarding.USER_ID, realUser.id),
            this.EQ(this.CanadaUsBusinessOnboarding.BUSINESS_ID, user.id)
          )
        ).then((o) => {
          this.caUsOnboardingComplete = o && o.status === this.OnboardingStatus.SUBMITTED;
        });
      }
    },

    /*
     * Update user compliance by coalescing it with signing officers compliance.
     */
    function coalesceUserAndSigningOfficersCompliance(user, signingOfficers) {
      if ( signingOfficers === undefined ) return;

      for ( let i = 0; i < signingOfficers.length; i++ ) {
        if ( user.compliance != signingOfficers[i].compliance ) {
          user.compliance = signingOfficers[0].compliance;
          return;
        }
      }
    },

    function isIframe () {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    }
  ],

  listeners: [
    function onUserAgentAndGroupLoaded() { 
      var self = this;
      this.userLoggedIn.resolve();
      if ( this.sme ) {
        window.onpopstate = async (event) => {
          var menu;
  
          // Redirect user to switch business if agent doesn't exist.
          if ( ! this.subject.realUser ) {
            menu = await this.client.menuDAO.find('sme.accountProfile.switch-business');
            menu.launch(this);
            return;
          }
  
          var hash = location.hash.substr(1);
  
          if ( hash == 'sme.main.onboarding' ) {
            this.onboardingUtil.initOnboardingView();
          }
  
          if ( hash == 'sme.main.onboarding.international' ) {
            this.onboardingUtil.initInternationalOnboardingView();
          }
          try {
            menu = await this.client.menuDAO.find(hash);
          }
          catch (err) {
            console.warn(`${this.FETCH_MENU_ERROR}: `, err);
          }
  
          // Any errors in finding the menu location to redirect
          // will result in a redirect to dashboard.
          if ( menu ) {
            menu.launch(this);
          }
  
          if ( hash != 'sme.accountProfile.signout' && hash !== '' ) {
            this.bannerizeCompliance();
          }
        };

        // Prevent action within platform if user is not a business. Redirect regular users to
        // switch business menu screen to select a business.
        this.stack$.dot('pos').sub(function() {
          if ( self.user.cls_ == net.nanopay.model.Business && self.loginSuccess ) {
            return;
          } else if (
            self.user.cls_ != self.Business &&
            self.loginSuccess &&
            location.hash != '#sme.accountProfile.switch-business'
          ) {
            self.pushMenu('sme.accountProfile.switch-business');
            self.notify(self.SELECT_BUSINESS_WARNING, 'warning');
          }
        });

        if ( ! this.subject.user.emailVerified ) {
          this.loginSuccess = false;
          this.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
          return;
        }

        // Update the look and feel now that the user is logged in since there
        // might be a more specific one to use now.
        this.fetchTheme();

        var hash = this.window.location.hash;
        if ( hash ) hash = hash.substring(1);

        if ( hash ) {
          window.onpopstate();
        } else if ( this.theme ) {
          this.window.location.hash = this.theme.defaultMenu;
        }
      }  

      else {
        // only show B2B onboarding if user is a Business
        if ( this.subject.user.type === 'Business' ) {
          // check account status and show UI accordingly
          switch ( this.subject.user.status ) {
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
              if ( this.subject.user.previousStatus === this.AccountStatus.SUBMITTED ) {
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
              if ( ! this.subject.user.createdPwd ) {
                this.loginSuccess = false;
                this.stack.push({ class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard', startAt: 6 });
                return;
              }
              if ( this.subject.user.onboarded ) break;
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

        if ( this.appConfig.mode == foam.nanos.app.Mode.PRODUCTION ) {
          this.bannerizeTwoFactorAuth();
        }
      }
    }
  ]
});
