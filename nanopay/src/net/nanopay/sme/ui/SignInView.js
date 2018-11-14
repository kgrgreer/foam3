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
    ^ .image {
      display: inline-block;
      height: 100%;
      width: 100%;
      float: right;
    }
    ^ .text-block {
      top: 20%;
      left: 25%;
      position: absolute;
    }
    ^ .text-input-container {
      margin-top: 10px;
    }
    ^ .input-field {
      font-size: 14px;
      height: 40px;
    }
    ^ .link {
      margin-left: 5px;
      color: #7404EA;
      cursor: pointer;
      font-size: 14px;
    }
    ^ .title {
      height: 30px;
      font-size: 20px;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
      margin-bottom: -5px;
    }
    ^ .subtitle {
      letter-spacing: 0.5px;
      text-align: left;
      color: #093400;
      margin-bottom: 15px;
      font-weight: 300;
    }
    ^ .labels {
      font-size: 14px;
      color: #093649;
      font-family: Roboto;
    }
    ^ .content-form {
      margin-top: 25vh;
      margin-right: 10vh;
      margin-left: 10vh;
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
    { name: 'SIGN_IN_TITLE', message: 'Sign in to Ablii' },
    { name: 'SIGN_UP_LABEL_1', message: 'Not a user yet?' },
    { name: 'SIGN_UP_LABEL_2', message: 'Create an account' },
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
        .addClass('img-replacement')
        // .start('img').addClass('image').attr('src', 'images/default-placeholder.png').end()
        .start().addClass('text-block')
          .start('h3').add(this.SLOGAN).end()
        .end();

      var right = this.Element.create()
        .addClass('content-form')
        .start().addClass('title').add(this.SIGN_IN_TITLE).end()
        .start().addClass('subtitle')
          .start('span').addClass('labels').add(this.SIGN_UP_LABEL_1).end()
          .start('span').addClass('link')
            .add(this.SIGN_UP_LABEL_2)
            .on('click', function() {
              self.stack.push({ class: 'net.nanopay.sme.ui.SignUpView' });
            })
          .end()
        .end()
        .start('form').addClass('signin-container')
          .start().addClass('text-input-container')
            .start().addClass('labels').add(this.EMAIL_LABEL).end()
            .start().addClass('input-field-container')
              .start(this.EMAIL).addClass('input-field')
                .start('img').addClass('input-image').attr('src', 'images/ic-email.png').end()
              .end()
            .end()
          .end()
          .start().addClass('text-input-container')
            .start().addClass('labels').add(this.PASSWORD_LABEL).end()
            .add(this.PASSWORD)
          .end()
          .start(this.LOG_IN).addClass('sme-button').end()
        .end()
        .start()
          .start('p').addClass('forgot-link')
            .add(this.FORGET_PASSWORD_LABEL)
            .on('click', function() {
              self.stack.push({ class: 'foam.nanos.auth.resetPassword.EmailView' });
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
