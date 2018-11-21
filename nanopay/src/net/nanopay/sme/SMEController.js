foam.CLASS({
  package: 'net.nanopay.sme',
  name: 'SMEController',
  extends: 'net.nanopay.ui.Controller',

  documentation: 'SME Top-Level Application Controller.',

  requires: [
    'net.nanopay.sme.ui.ChangePasswordView',
    'net.nanopay.sme.ui.ResendPasswordView',
    'net.nanopay.sme.ui.ResetPasswordView',
    'net.nanopay.sme.ui.SMEModal',
    'net.nanopay.sme.ui.SMEStyles',
    'net.nanopay.sme.ui.SMEWizardOverview',
    'net.nanopay.sme.ui.SuccessPasswordView',
    'net.nanopay.sme.ui.ToastNotification',
    'net.nanopay.sme.ui.VerifyEmail'
  ],

  exports: [
    'agent',
    'appConfig',
    'as ctrl',
    'balance',
    'currentAccount',
    'findAccount',
    'findBalance',
    'privacyUrl',
    'termsUrl'
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
    }
  ],

  methods: [
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

        foam.__context__.register(self.ActionView, 'foam.u2.ActionView');
        foam.__context__.register(self.SMEWizardOverview, 'net.nanopay.ui.wizard.WizardOverview');
        foam.__context__.register(self.SMEModal, 'foam.u2.dialog.Popup');
        foam.__context__.register(self.ResetPasswordView, 'foam.nanos.auth.resetPassword.EmailView');
        foam.__context__.register(self.ResendPasswordView, 'foam.nanos.auth.resetPassword.ResendView');
        foam.__context__.register(self.ChangePasswordView, 'foam.nanos.auth.resetPassword.ResetView');
        foam.__context__.register(self.SuccessPasswordView, 'foam.nanos.auth.resetPassword.SuccessView');
        foam.__context__.register(self.VerifyEmail, 'foam.nanos.auth.ResendVerificationEmail');
        foam.__context__.register(self.ToastNotification, 'foam.u2.dialog.NotificationMessage');

        self.findBalance();
        self.addClass(self.myClass())
          .tag('div', null, self.topNavigation_$)
          .start()
            .addClass('stack-wrapper')
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

      // don't go to log in screen if going to reset password screen
      if ( location.hash != null && location.hash === '#reset' ) {
        return new Promise(function(resolve, reject) {
          self.stack.push({ class: 'foam.nanos.auth.resetPassword.ResetView' }); // TODO SME specific
          self.loginSuccess$.sub(resolve);
        });
      }

      // don't go to log in screen if going to sign up password screen
      if ( location.hash != null && location.hash === '#sign-up' ) {
        return new Promise(function(resolve, reject) {
          self.stack.push({ class: 'net.nanopay.sme.ui.SignUpView' });
          self.loginSuccess$.sub(resolve);
        });
      }

      // don't go to log in screen if going to sign up password screen
      if ( location.hash != null && location.hash === '#sign-up/full' ) {
        var searchParams = new URLSearchParams(location.search);
        return new Promise(function(resolve, reject) {
          self.stack.push({
            class: 'net.nanopay.sme.ui.SignUpView',
            isFullSignup: true,
            emailField: searchParams.get('email'),
            signUpToken: searchParams.get('token')
          });
          self.loginSuccess$.sub(resolve);
        });
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
          self.user.copyFrom(result);

          // check if user email verified
          if ( ! self.user.emailVerified ) {
            self.loginSuccess = false;
            self.stack.push({ class: 'foam.nanos.auth.ResendVerificationEmail' });
            return;
          }

          self.onUserUpdate();
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
          self.agent.copyFrom(result);

          self.onUserUpdate();
        }
      }).catch(function(err) {
        self.requestLogin().then(function() {
          self.getCurrentUser();
        });
      });
    },
  ],

});
