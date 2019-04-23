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
      padding-top: 20px;
      width: 490px;
      height: 150px;
      border-radius: 2px;
      background-color: #ffffff;
    }
    ^ p {
      display: inline-block;
    }
    ^ .label {
      height: 16px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      text-align: left;
      color: #093649;
      margin-bottom: 8px;
      margin-left: 25px;
    }
    ^ .full-width-input {
      width: 90%;
      height: 40px;
      margin-left: 5%;
      margin-bottom: 15px;
      outline: none;
      padding: 10px;
    }
    ^ .full-width-button {
      width: 90%;
      height: 40px;
      border-radius: 2px;
      margin: 0 auto;
      text-align: center;
      line-height: 40px;
      cursor: pointer;
      color: #ffffff;
      margin-top: 10px;
      margin-left: 25px;
    }
    ^ .tf-container {
      width: 450px;
      margin: auto;
    }
    ^ .full-width-button > span {
      position: relative;
      top: -5px;
    }
    ^ .net-nanopay-ui-ActionView-verify {
      padding-top: 4px;
    }
    ^ .caption {
      margin: 15px 0px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'twoFactorToken',
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
          .start('form').addClass('tfa-container')
            .start().addClass('label').add(this.TWO_FACTOR_LABEL).end()
            .start(this.TWO_FACTOR_TOKEN).addClass('full-width-input').end()
            .start(this.VERIFY).addClass('full-width-button').end()
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