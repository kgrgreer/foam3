foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SignInView',
  extends: 'foam.u2.Controller',

  documentation: 'User Signin view for Ablii',

  imports: [
    'auth',
    'loginSuccess',
    'stack',
    'user'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.sme.ui.SplitBorder'
  ],

  css: `
    ^ {
      position: relative;
    }
    ^ .image {
      display: inline-block;
      width: 100%;
    }
    ^ .image-wrapper {
      margin: auto;
      width: 80%;
      max-width: 500px;
      margin-top: 60px;
    }
    ^ .text-block {
      top: 20%;
      left: 25%;
      position: absolute;
    }

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
    }
    ^ .logo-img {
      width: 80px;
      margin-bottom: 16px;
    }
    ^ .login-logo-img {
      width: 80px;
      margin-bottom: 16px;
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
    { name: 'SLOGAN', message: 'Ablii makes payables and receivables a breeze.' },
    { name: 'SIGN_IN_TITLE', message: 'Welcome back' },
    { name: 'SIGN_UP_LABEL_1', message: "Don't have an account?" },
    { name: 'SIGN_UP_LABEL_2', message: 'Sign up' },
    { name: 'EMAIL_LABEL', message: 'Email Address' },
    { name: 'PASSWORD_LABEL', message: 'Password' },
    { name: 'FORGET_PASSWORD_LABEL', message: 'Forgot your password?' }
  ],

  methods: [
    function initE() {
      var self = this;

      var split = net.nanopay.sme.ui.SplitBorder.create();

      var left = this.Element.create()
        // Todo: replace the img-replacement

        // .start().addClass('image-wrapper')
          // .start('img').addClass('image').attr('src', 'images/ablii-login.png').end()
        // .start().addClass('text-block')
        //   .start('h3').add(this.SLOGAN).end()
        // .end();
        // .end();

      var right = this.Element.create()
        .addClass('content-form')
        .start('img').addClass('login-logo-img').attr('src', 'images/ablii-wordmark.svg').end()
        .start().addClass('sme-title').add(this.SIGN_IN_TITLE).end()
        .start('form').addClass('signin-container')
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add(this.EMAIL_LABEL).end()
            .start().addClass('input-field-wrapper')
              .start(this.EMAIL).addClass('input-field').addClass('image').attr('placeholder', 'john@doe.com')
                .start('img').addClass('input-image').attr('src', 'images/ic-email.png').end()
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
              self.stack.push({ class: 'foam.nanos.auth.resetPassword.EmailView', signInView: { class: 'net.nanopay.sme.ui.SignInView'} });
            })
          .end()
        .end();

      split.leftPanel.add(left);
      split.rightPanel.add(right);

      this.addClass(this.myClass()).addClass('full-screen').add(split);
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
            self.add(self.NotificationMessage.create({
                message: 'Login Successful.' }));
          }
        }).catch(function(a) {
          self.add(self.NotificationMessage.create({
              message: a.message + '. Please try again.', type: 'error' }));
        });
      }
    }
  ]
});
