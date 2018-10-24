foam.CLASS({
  package: 'net.nanopay.sme',
  name: 'SMEController',
  extends: 'net.nanopay.ui.Controller',

  documentation: 'SME Top-Level Application Controller.',

  requires: [
    'net.nanopay.sme.ui.SMEStyles',
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
    'hideNavFooter'
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'hideNavFooter'
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this.clientPromise.then(function() {
        self.client.nSpecDAO.find('appConfig').then(function(config) {
          self.appConfig.copyFrom(config.service);
        });

        self.SMEStyles.create();
        self.AppStyles.create();
        self.InvoiceStyles.create();
        self.ModalStyling.create();

        foam.__context__.register(self.ActionView, 'foam.u2.ActionView');

        self.findBalance();
        self.addClass(self.myClass())
          .start('div', null, self.topNavigation_$)
            .hide(self.hideNavFooter$)
          .end()
          .start()
            .addClass('stack-wrapper')
            .tag({
              class: 'foam.u2.stack.StackView',
              data: self.stack,
              showActions: false
            })
          .end()
          .start('div', null, self.footerView_$)
            .hide(self.hideNavFooter$)
          .end();

          /*
            This is mandatory.
            'topNavigation_' & 'footerView' need empty view when initialize,
            otherwise they won't toggle after signin.
          */
          self.topNavigation_.add(foam.u2.View.create());
          self.footerView_.add(foam.u2.View.create());
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

      return new Promise(function(resolve, reject) {
        self.stack.push({ class: 'net.nanopay.sme.ui.SignInView' });
        self.loginSuccess$.sub(resolve);
      });
    }
  ],

});
