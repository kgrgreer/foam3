foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SignInView',
  extends: 'foam.u2.Controller',

  documentation: 'User Signin view for Ablii',

  imports: [
    'auth',
    'loginSuccess',
    'menuDAO',
    'stack',
    'user',
    'validateEmail'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.sme.ui.SplitBorder'
  ],

  css: `
    ^ .title {
      height: 30px;
      font-size: 30px;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #353535;
      margin-bottom: 40px;
      font-weight: 900;
    }
    ^ .content-form {
      margin: auto;
      width: 375px;
      margin-top: 20vh;
    }
    ^ .input-field {
      width: 100%;
      height: 40px;
      outline: none;
      padding-top: 10px;
      padding-left: 10px;
      padding-bottom: 10px;
      padding-right: 30px;
      background: white;
    }
    ^ .login-logo-img {
        height: 19.4;
        margin-bottom: 8px;
    }
    ^button {
      margin-top: 56px;
      cursor: pointer;
      font-size: 16px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #8e9090;
      display: inline;
      position: relative;
      top: 20px;
      left: 20px;
    }

    /* This is required for the visibility icon of the password field */
    ^ .input-image {
      position: absolute !important;
      width: 16px !important;
      height: 16px !important;
      bottom: 12px !important;
      right: 12px !important;
    }

    /* This is required to set the position of visibility icon */
    ^ .input-field-container {
      position: relative;
    }
    ^ .full-width-input-password {
      padding: 12px 34px 12px 12px ! important;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email'
    },
    {
      class: 'Password',
      name: 'password',
      view: { class: 'foam.u2.view.PasswordView', passwordIcon: true }
    }
  ],

  messages: [
    { name: 'SIGN_IN_TITLE', message: 'Welcome!' },
    { name: 'SIGN_UP_LABEL_1', message: `Not a user yet?` },
    { name: 'SIGN_UP_LABEL_2', message: 'Create an account' },
    { name: 'EMAIL_LABEL', message: 'Email Address' },
    { name: 'PASSWORD_LABEL', message: 'Password' },
    { name: 'FORGET_PASSWORD_LABEL', message: 'Forgot password?' },
    { name: 'GO_BACK', message: 'Go to ablii.com' },
    { name: 'TOP_MESSAGE', message: `Ablii is currently in early access, for now only approved emails can create an account.  Contact us at hello@ablii.com if you'd like to join!` }
  ],

  methods: [
    function initE() {
      var self = this;
      var split = net.nanopay.sme.ui.SplitBorder.create();

      var left = this.Element.create()
        .addClass('cover-img-block')
        .start('img')
          .addClass('sme-image')
          .attr('src', 'images/sign_in_illustration.png')
        .end();

      var right = this.Element.create()
        .addClass('content-form')
        .start('img').addClass('login-logo-img').attr('src', 'images/ablii-wordmark.svg').end()
        .start().addClass('sme-title').add(this.SIGN_IN_TITLE).end()
        .start('form').addClass('signin-container')
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add(this.EMAIL_LABEL).end()
            .start().addClass('input-field-wrapper')
              .start(this.EMAIL).addClass('input-field')
                .attr('placeholder', 'you@example.com')
              .end()
            .end()
          .end()
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add(this.PASSWORD_LABEL).end()
            .add(this.PASSWORD)
          .end()
          .start(this.LOG_IN).addClass('sme-button').addClass('block').addClass('login').end()
        .end()
        .start()
          .start().addClass('sme-subtitle')
            .start('strong').add(this.SIGN_UP_LABEL_1).end()
            .start('span').addClass('app-link')
              .add(this.SIGN_UP_LABEL_2)
              .on('click', function() {
                self.stack.push({ class: 'net.nanopay.sme.ui.SignUpView' });
              })
            .end()
          .end()
          .start('p').addClass('forgot-link')
            .add(this.FORGET_PASSWORD_LABEL)
            .on('click', function() {
              self.stack.push({
                class: 'foam.nanos.auth.resetPassword.EmailView',
                signInView: { class: 'net.nanopay.sme.ui.SignInView' }
              });
            })
          .end()
        .end();

      split.leftPanel.add(left);
      split.rightPanel.add(right);

      this.addClass(this.myClass()).addClass('full-screen')
      .start().addClass('top-bar')
        .start().addClass('top-bar-message')
            .add(this.TOP_MESSAGE)
        .end()
        .start().addClass('top-bar-inner')
          .start().addClass(this.myClass('button'))
            .start()
              .addClass('horizontal-flip')
              .addClass('inline-block')
              .add('➔')
            .end()
            .add(this.GO_BACK)
            .on('click', () => {
              window.location = 'https://www.ablii.com';
            })
          .end()
        .end()
      .end()
      .add(split);
    }
  ],

  actions: [
    {
      name: 'logIn',
      label: 'Sign in',
      code: function(X, obj) {
        var self = this;

        if ( ! this.email ) {
          this.add(this.NotificationMessage.create({
              message: 'Please enter an email address', type: 'error' }));
          return;
        }

        if ( ! this.password ) {
          this.add(this.NotificationMessage.create({
              message: 'Please enter a password', type: 'error' }));
          return;
        }

        if ( ! this.validateEmail(this.email) ) {
          this.add(this.NotificationMessage.create({
              message: 'Invalid email address.', type: 'error' }));
          return;
        }

        this.auth.loginByEmail(X, this.email, this.password).then(function(user) {
          if ( user && user.twoFactorEnabled ) {
            self.loginSuccess = false;
            self.user.copyFrom(user);
            self.stack.push({
              class: 'foam.nanos.auth.twofactor.TwoFactorSignInView'
            });
          } else {
            self.loginSuccess = user ? true : false;
            self.user.copyFrom(user);
            if ( ! self.user.emailVerified ) {
              self.stack.push({
                class: 'foam.nanos.auth.ResendVerificationEmail'
              });
            } else {
              // This is required for signin
              window.location.hash = '';
            }
          }
        }).catch(function(a) {
          self.add(self.NotificationMessage.create({ message: a.message, type: 'error' }));
        });
      }
    }
  ]
});
