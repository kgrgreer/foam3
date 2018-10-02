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
    'termsUrl'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.SMEStyles.create();
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
