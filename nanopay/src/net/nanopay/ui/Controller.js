/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'foam.dao.PromisedDAO',
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.logger.Logger',
    'foam.nanos.notification.Notification',
    'foam.nanos.notification.ToastState',
    'foam.nanos.u2.navigation.FooterView',
    'foam.nanos.u2.navigation.TopNavigation',
    'foam.core.Currency',
    'foam.core.Latch',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'net.nanopay.account.Account',
    'net.nanopay.account.Balance',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.accounting.AccountingIntegrationUtil',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus',
    'foam.nanos.auth.AgentJunctionStatus',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.BRBankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.bank.USBankAccount',
    'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization',
    'net.nanopay.invoice.ui.style.InvoiceStyles',
    'net.nanopay.model.Business',
    'net.nanopay.model.BusinessUserJunction',
    'net.nanopay.sme.onboarding.CanadaUsBusinessOnboarding',
    'net.nanopay.sme.onboarding.OnboardingStatus',
    'net.nanopay.sme.ui.SMEModal',
    'net.nanopay.sme.ui.SMEStyles',
    'net.nanopay.sme.ui.SMEWizardOverview',
    'net.nanopay.sme.ui.SuccessPasswordView',
    'net.nanopay.sme.ui.TwoFactorSignInView',
    'net.nanopay.sme.ui.VerifyEmailView',
    'net.nanopay.ui.banner.BannerData',
    'net.nanopay.ui.ConnectSubMenu',
    'net.nanopay.ui.modal.ModalStyling',
    'net.nanopay.ui.modal.SessionTimeoutModal',
    'net.nanopay.ui.style.AppStyles',
    'net.nanopay.util.OnboardingUtil'
  ],

  imports: [
    'accountDAO',
    'agentAuth',
    'businessDAO',
    'canadaUsBusinessOnboardingDAO',
    'crunchService',
    'digitalAccount',
    'balanceDAO',
    'notificationDAO'
  ],

  exports: [
    'accountingIntegrationUtil',
    'appConfig',
    'as ctrl',
    'assignBusinessAndLogIn',
    'balance',
    'bannerData',
    'bannerizeCompliance',
    'checkAndNotifyAbilityToPay',
    'checkAndNotifyAbilityToReceive',
    'currentAccount',
    'findAccount',
    'findBalance',
    'homeDenomination',
    'initLayout',
    'isMenuOpen',
    'isIframe',
    'onboardingUtil',
    'privacyUrl',
    'pushDefaultMenu',
    'showFooter',
    'showNav',
    'sme',
    'termsUrl'
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
    .foam-flow-Document h1,
    .foam-flow-Document h2,
    .foam-flow-Document h3,
    .foam-flow-Document h4,
    .foam-flow-Document h5 {
      margin: 12px 0 12px 0;
      color: #292e31;
    }
    .foam-flow-Document p {
      margin-bottom: 10px;
      margin-top: 10px;
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

    @media print {
      ^ .foam-nanos-menu-VerticalMenu {
        display: none !important;
      }
      ^ .foam-u2-stack-StackView {
        padding-left: 0 !important;
      }
    }
  `,

  messages: [
    {
      name: 'TWO_FACTOR_REQUIRED_ONE',
      message: 'For your security, two factor authentication is required to send payment.'
    },
    {
      name: 'TWO_FACTOR_REQUIRED_TWO',
      message: 'Click here to set up.'
    },
    {
      name: 'QUERY_BANK_AMOUNT_ERROR',
      message: 'An unexpected error occurred while counting the number of bank accounts the user has: '
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
    },
    {
      name: 'BUSINESS_LOGIN_FAILED',
      message: 'Error trying to log into business.'
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
      name: 'initLayout',
      documentation: 'A latch used to wait on layout initialization.',
      factory: function() {
        return this.Latch.create();
      }
    },
    {
      class: 'Boolean',
      name: 'layoutInitialized',
      documentation: 'True if layout has been initialized.',
      expression: async function(initLayout) {
        await initLayout;
        return true;
      }
    },
    {
      name: 'loginVariables',
      expression: function( client$smeUserRegistrationDAO ) {
        return {
          dao_: client$smeUserRegistrationDAO || null,
          imgPath: this.theme.loginImage
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
      class: 'Boolean',
      name: 'showFooter',
      value: true
    },
    {
      class: 'Boolean',
      name: 'showNav',
      value: true
    },
    {
      class: 'Boolean',
      name: 'isMenuOpen',
      factory: function() {
        return window.localStorage['isMenuOpen'] === 'true'
         || ( window.localStorage['isMenuOpen'] = false );
      },
      postSet: function(_, n) {
        window.localStorage['isMenuOpen'] = n;
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'enabledBusinesses_',
      documentation: `
        The DAO used to populate the enabled businesses in the list.
      `,
      expression: function(subject) {
        var party = subject.realUser;
        return this.PromisedDAO.create({
          promise: party.entities.dao
            .where(this.NEQ(this.Business.STATUS, this.AccountStatus.DISABLED))
            .select(this.MAP(this.Business.ID))
            .then(mapSink => {
              return party.entities.junctionDAO.where(
                this.AND(
                  this.EQ(this.UserUserJunction.SOURCE_ID, party.id),
                  this.IN(this.UserUserJunction.TARGET_ID, mapSink.delegate.array),
                  this.NEQ(this.UserUserJunction.STATUS, this.AgentJunctionStatus.DISABLED)
                )
              );
            })
        });
      }
    },
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

      this.client.nSpecDAO.find('appConfig').then(config => {
        this.appConfig.copyFrom(config.service);

        this.AppStyles.create();
        this.InvoiceStyles.create();
        this.ModalStyling.create();

        this.SMEStyles.create();

        // TODO & NOTE: This is a workaround. This prevents the CSS from breaking when viewing it in a subclass first before the parent class.
        this.BankPadAuthorization.create({}, this.__subContext__.createSubContext({errors: foam.core.SimpleSlot.create()}));

        this.__subContext__.register(this.ConnectSubMenu, 'foam.nanos.menu.SubMenu');
        this.__subContext__.register(this.SMEWizardOverview, 'net.nanopay.ui.wizard.WizardOverview');
        this.__subContext__.register(this.SMEModal, 'foam.u2.dialog.Popup');
        this.__subContext__.register(this.SuccessPasswordView, 'foam.nanos.auth.resetPassword.SuccessView');
        this.__subContext__.register(this.VerifyEmailView, 'foam.nanos.auth.ResendVerificationEmail');
        this.__subContext__.register(this.NotificationMessage, 'foam.u2.dialog.NotificationMessage');
        this.__subContext__.register(this.TwoFactorSignInView, 'foam.nanos.auth.twofactor.TwoFactorSignInView');

        this.themeInstalled.resolve();
      });

      await this.themeInstalled;
      await this.languageInstalled;

      if ( ! this.isIframe() ) {
        this
          .addClass(this.myClass())
          .add(this.slot( async function(loginSuccess, topNavigation_) {
            if ( ! loginSuccess ) return null;
            await this.initLayout;
            return this.E().tag(topNavigation_).show(this.showNav$);
          }))
          .start()
            .addClass('stack-wrapper')
            .tag({
              class: 'net.nanopay.ui.banner.Banner',
              data$: this.bannerData$
            })
            .start({class: this.StackView, data: this.stack, showActions: false})
              .enableClass('login-stack', this.layoutInitialized$.map( li => ! li ))
              .enableClass('application-stack', this.layoutInitialized$.map( li => li ))
            .end()
          .end()
          .start().show(this.showFooter$)
            .enableClass('footer-wrapper', this.loginSuccess$)
            .add(this.slot( async function(loginSuccess, footerView_) {
              if ( loginSuccess ) await this.initLayout;
              return this.E().tag(footerView_);
            }))
          .end();
      } else {
        this
          .addClass(this.myClass())
          .start()
            .addClass('stack-wrapper')
            .tag({
              class: 'net.nanopay.ui.banner.Banner',
              data$: this.bannerData$
            })
            .start(this.StackView.create({data: this.stack, showActions: false}))
              .style({'margin-top': '55px'})
            .end()
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

    async function fetchSubject() {
      /** Get current user, else show login. */
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const otLoginToken = urlParams.get('otltoken');

        if ( otLoginToken != null ) {
          await this.client.otLoginService.loginTokenId(null, otLoginToken);
          window.location.href = "/";
        }

        var result = await this.client.auth.getCurrentSubject(null);

        if ( ! result || ! result.user) throw new Error();

        this.subject = result;
      } catch (err) {
        this.languageInstalled.resolve();
        await this.requestLogin();
        return await this.fetchSubject();
      }
    },

    function bannerizeTwoFactorAuth() {
      if ( this.appConfig.mode == foam.nanos.app.Mode.PRODUCTION &&
           this.theme.twoFactorEnabled &&
           ! this.subject.user.twoFactorEnabled ) {
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
      var view = { class: 'foam.u2.borders.BrowserSupportBorder', children: [
              { class: 'foam.u2.view.LoginView', mode_: 'SignIn' }
            ]};
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
              })
              .catch((err) => {
                if ( err.message && err.message === "Token has already been used" ) {
                  view = {
                      class: 'net.nanopay.sme.ui.SuccessPasswordView'
                  };
                  self.stack.push(view, self);
                } else {
                  throw err;
                }
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
      return true;
    },

    /**
     * This function is to check if 2FA is required and if so, is it
     * enabled for the user. It is only required for payables.
     */
    async function check2FA() {
      var canPayInvoice = await this.client.auth.check(null, 'business.invoice.pay') && await this.client.auth.check(null, 'user.invoice.pay');

      if ( canPayInvoice &&
           ! this.subject.realUser.twoFactorEnabled &&
           this.theme.twoFactorEnabled ) {
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
        this.add(this.NotificationMessage.create({
           message: TwoFactorNotificationDOM,
           type: this.LogLevel.WARN,
           description: ''
         }));

        if ( this.appConfig.mode != foam.nanos.app.Mode.PRODUCTION ||
             ! this.theme.twoFactorEnabled ) {
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
        return result ? await this.check2FA() : result;
      } catch (err) {
        console.warn(`${this.ABILITY_TO_PAY_ERROR}: `, err);
        this.notify(`${this.ABILITY_TO_PAY_ERROR}.`, '', this.LogLevel.ERROR, true);
      }
    },

    async function checkAndNotifyAbilityToReceive() {
      try {
        return await this.checkComplianceAndBanking();
      } catch (err) {
        console.warn(`${this.ABILITY_TO_RECEIVE_ERROR}: `, err);
        this.notify(`${this.ABILITY_TO_RECEIVE_ERROR}.`, '', this.LogLevel.ERROR, true);
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
            this.INSTANCE_OF(this.CABankAccount),
            this.INSTANCE_OF(this.USBankAccount),
            this.INSTANCE_OF(this.BRBankAccount)
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
    },
    async function assignBusinessAndLogIn(junction) {
      var business = await this.client.businessDAO.find(junction.targetId);
      try {
        await this.client.agentAuth.actAs(this, business);
        this.initLayout.resolve();
        this.pushDefaultMenu()
      } catch (err) {
        var msg = err != null && typeof err.message === 'string'
          ? err.message
          : this.BUSINESS_LOGIN_FAILED;
        this.notify(msg, '', this.LogLevel.ERROR, true);
      }
      return
    },
    async function pushDefaultMenu() {
      //check if default menu is avaiable. if default menu is not permitted yet, direct to appStore
      var menu = await this.client.menuDAO.find(this.theme.defaultMenu) ?
      this.theme.defaultMenu :
      'sme.main.appStore';
      this.pushMenu(menu);
    },
  ],

  listeners: [
    function onUserAgentAndGroupLoaded() {
      var self = this;
      this.loginSuccess = true;

      if ( this.sme ) {
        window.onpopstate = async event => {
          var menu;

          // Redirect user to switch business if agent doesn't exist.
          if ( this.subject.realUser.id === this.subject.user.id ) {
            let sink = await this.enabledBusinesses_.select();
            var ac = this.theme.admissionCapability;
            if ( ac ) {
              var ucj = await this.client.crunchService.getJunction(null, ac);
              //Check if user has finished registration
              if ( ucj.status !==  this.CapabilityJunctionStatus.GRANTED ) {
                this.onboardingUtil.initUserRegistration(ac);
                return;
              }
              if ( sink.array.length === 0 ) {
                // if sink.array.length === 0, push to default page
                this.initLayout.resolve();
                await this.pushDefaultMenu();
                return;
              }

              if ( sink.array.length === 1 ) {
                this.initLayout.resolve();
                var junction = sink.array[0];
                await this.assignBusinessAndLogIn(junction);
                return;
              }
            }
          }

          var hash = location.hash.substr(1);


          this.memento.value = hash;

          if ( hash !== 'sme.accountProfile.switch-business' ) {
            this.initLayout.resolve();
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

        if ( ! this.subject.user.emailVerified ) {
          this.loginSuccess = false;
          this.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
          return;
        }
      } else {
        this.initLayout.resolve();
        this.bannerizeTwoFactorAuth();
      }

      // Update the look and feel now so that if the user is logged in there
      // might be a more specific one to use now.
      this.SUPER();
    }
  ]
});
