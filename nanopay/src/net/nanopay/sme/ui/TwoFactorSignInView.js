foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'TwoFactorSignInView',
  extends: 'foam.u2.Controller',

  documentation: 'Two-Factor sign in view',

  imports: [
    'loginSuccess',
    'notify',
    'twofactor',
    'user'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  css: `
    ^ .tfa-container {
      padding: 24px;
      width: 490px;
      border-radius: 2px;
      background-color: #ffffff;
    }
    ^ .tf-container {
      width: 450px;
      margin: auto;
    }
    ^ .foam-u2-ActionView-verify {
      padding-top: 4px;
    }
    ^ .caption {
      margin: 15px 0px;
    }
    ^ input {
      width: 100%;
    }
    ^button-container {
      display: flex;
      justify-content: flex-end;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'twoFactorToken',
      view: {
        class: 'foam.u2.TextField',
        focused: true
      }
    }
  ],

  messages: [
    { name: 'TWO_FACTOR_NO_TOKEN', message: 'Please enter a verification token.' },
    { name: 'TWO_FACTOR_SUCCESS', message: 'Login successful.' },
    { name: 'TWO_FACTOR_LABEL', message: 'Token' },
    { name: 'TWO_FACTOR_ERROR', message: 'Login failed. Please try again.' },
    { name: 'TWO_FACTOR_TITLE', message: 'Two-Factor Authentication' },
    { name: 'TWO_FACTOR_EXPLANATION', message: `Two-factor authentication is an extra layer of security for your Ablii account
        designed to ensure that you're the only person who can access your account, even if someone knows your password.
        Please get you code and enter it below. Please contact us at hello@ablii.com if you have lost your code.`
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .tag({ class: 'net.nanopay.sme.ui.AbliiEmptyTopNavView' })
        .start().addClass('tf-container')
          .start('h1').add(this.TWO_FACTOR_TITLE).end()
          .start().addClass('caption').addClass('explanation-container')
            .add(this.TWO_FACTOR_EXPLANATION)
          .end()
          .start('form')
            .addClass('tfa-container')
            .start('label')
              .add(this.TWO_FACTOR_LABEL)
            .end()
            .start('p')
              .tag(this.TWO_FACTOR_TOKEN)
            .end()
            .start()
              .addClass(this.myClass('button-container'))
              .tag(this.VERIFY)
            .end()
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'verify',
      code: function(X) {
        var self = this;

        if ( ! this.twoFactorToken ) {
          this.notify(this.TWO_FACTOR_NO_TOKEN, 'error');
          return;
        }

        this.twofactor.verifyToken(null, this.twoFactorToken)
        .then(function(result) {
          if ( result ) {
            self.loginSuccess = true;
            self.notify(self.TWO_FACTOR_SUCCESS);
          } else {
            self.loginSuccess = false;
            self.notify(self.TWO_FACTOR_ERROR, 'error');
          }
        });
      }
    }
  ]
});