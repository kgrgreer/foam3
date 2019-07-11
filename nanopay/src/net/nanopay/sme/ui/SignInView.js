foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SignInView',
  extends: 'foam.u2.Controller',

  documentation: 'User Signin view for Ablii',

  imports: [
    'auth',
    'loginSuccess',
    'menuDAO',
    'notify',
    'smeBusinessRegistrationDAO',
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
    ^ input {
      width: 100%;
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
    ^ .foam-u2-dialog-InlineNotificationMessage {
      margin-bottom: 20px;
    }
    ^ .foam-u2-dialog-InlineNotificationMessage-inner {
      line-height: 1.5;
      font-size: 14px;
    }
    ^ .foam-u2-dialog-InlineNotificationMessage-message {
      width: 80%;
      margin: 10px;
    }
    ^ .password-link {
      display: inline-block;
      margin: 0;
      font-size: 12px;
      float: right;
      color: #604aff;
      cursor: pointer;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'email',
      view: {
        class: 'foam.u2.TextField',
        focused: true
      }
    },
    {
      class: 'Password',
      name: 'password',
      view: { class: 'foam.u2.view.PasswordView', passwordIcon: true }
    },
    {
      class: 'String',
      name: 'errorMessage',
      value: ''
    },
    {
      class: 'String',
      name: 'messageType'
    },
    {
      class: 'Boolean',
      name: 'disableEmail'
    },
    {
      class: 'String',
      name: 'signUpToken'
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
      var emailDisplayMode = this.disableEmail ?
      foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;

      var searchParams = new URLSearchParams(location.search);
      this.email = searchParams.get('email');

      var left = this.Element.create()
        .addClass('cover-img-block')
        .start('img')
          .addClass('sme-image')
          .attr('src', 'images/sign_in_illustration.png')
        .end();

      var right = this.Element.create()
        .addClass('content-form')
        .tag({ class: 'foam.u2.dialog.InlineNotificationMessage', type$: this.messageType$, message$: this.errorMessage$ })
        .start('img').addClass('login-logo-img').attr('src', 'images/ablii-wordmark.svg').end()
        .start().addClass('sme-title').add(this.SIGN_IN_TITLE).end()
        .start('form').addClass('signin-container')
          .start().addClass('input-wrapper')
            .start().addClass('input-label').add(this.EMAIL_LABEL).end()
            .start().addClass('input-field-wrapper')
              .start(this.EMAIL, {
                mode: emailDisplayMode,
                focused: true
              })
                .attr('placeholder', 'you@example.com')
              .end()
            .end()
          .end()
          .start().addClass('input-wrapper')
            .start()
              .addClass('input-label')
              .addClass('inline')
              .add(this.PASSWORD_LABEL)
            .end()
            .start('p').addClass('password-link')
              .add(this.FORGET_PASSWORD_LABEL)
              .on('click', function() {
                self.stack.push({
                  class: 'foam.nanos.auth.resetPassword.EmailView'
                });
              })
            .end()
            .add(this.PASSWORD)
          .end()
          .start(this.LOG_IN, { size: 'LARGE' }).addClass('block').addClass('login').end()
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
        .end();

      split.leftPanel.add(left);
      split.rightPanel.add(right);

      this.addClass(this.myClass()).addClass('full-screen')
      .start().addClass('top-bar')
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
      code: async function(X, obj) {
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

        try {
          var usr = await this.auth.loginByEmail(X, this.email, this.password);
          if ( ! usr ) return;
          usr.signUpToken = this.signUpToken;
          this.user.copyFrom(usr);
          await this.invitedTokenProcess();
          if ( this.user && this.user.twoFactorEnabled ) {
            this.loginSuccess = false;
            window.history.replaceState({}, document.title, '/');
            this.stack.push({
              class: 'foam.nanos.auth.twofactor.TwoFactorSignInView'
            });
          } else {
            this.loginSuccess = this.user ? true : false;
            if ( ! this.user.emailVerified ) {
              this.stack.push({
                class: 'foam.nanos.auth.ResendVerificationEmail'
              });
            } else {
              // This is required for signin
              window.location.hash = '';
              window.location.reload();
            }
          }
        } catch (error) {
          this.messageType = 'error';
          this.errorMessage = error.message;
        }
      }
    },

    async function invitedTokenProcess() {
      if ( ! this.signUpToken ) return;
      var returnedTempUser = await this.smeBusinessRegistrationDAO.put(this.user);
      if ( returnedTempUser ) {
        this.user.copyFrom(returnedTempUser);
      } else {
        this.notify('User was invited to a business however an error has occurred during processing.', 'error');
      }
    }
  ]
});
