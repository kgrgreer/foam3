foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'ChangePasswordView',
    extends: 'foam.u2.Controller',

    documentation: 'Ablii Forgot Password Reset View',

    imports: [
      'resetPasswordToken',
      'stack'
    ],

    requires: [
      'foam.nanos.auth.User',
      'foam.u2.dialog.NotificationMessage'
    ],

    css: `
      ^{
        margin: auto;
        text-align: center;
        background: #fff;
        min-height: 100vh;
        width: 100%;
      }

      ^ .Message-Container{
        width: 330px;
        height: 100%;
        border-radius: 2px;
        padding-top: 5px;
        margin: auto;
      }

      ^ .Forgot-Password{
        font-family: lato;
        font-size: 30px;
        font-weight: bold;
        line-height: 48px;
        letter-spacing: 0.5px;
        text-align: left;
        color: /*%BLACK%*/ #1e1f21;
        text-align: center;
        font-weight: 900;
        margin-bottom: 8px;
        padding-top: 20vh;
      }
  
      ^ p{
        display: inline-block;
      }
  
      ^ .link{
        margin-left: 2px;
        color: #59a5d5;
        cursor: pointer;
        font-size: 16px;
      }
  
      ^ .Instructions-Text{
        height: 16px;
        height: 24px;
        font-family: Lato;
        font-size: 16px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.5;
        letter-spacing: normal;
        text-align: center;
        color: #525455;
      }
  
      ^ .Email-Text{
        width: 182px;
        height: 16px;
        font-family: Roboto;
        font-weight: 300;
        letter-spacing: 0.2px;
        text-align: left;
        color: /*%BLACK%*/ #1e1f21;
        margin-top: 30px;
        margin-bottom: 8px;
        margin-left: 0px;
        margin-right: 288px;
      }
  
      ^ .input-Box{
        width: 100%;
        height: 40px;
        background-color: #ffffff;
        border: solid 1px rgba(164, 179, 184, 0.5);
        margin-bottom: 10px;
        padding-left: 8px;
        padding-right: 8px;
        margin: 0px;
        font-family: Roboto;
        font-size: 14px;
        text-align: left;
        color: /*%BLACK%*/ #1e1f21;
        font-weight: 300;
        letter-spacing: 0.2px;
        border-radius: 3px;
        box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
        border: solid 1px #8e9090;
        margin-bottom: 32px;
      }
  
      ^ .Next-Button {
        margin-top: 32px;
      }

      ^ .top-bar {
        width: 100%;
        height: 64px;
        border-bottom: solid 1px #e2e2e3
      }

      ^ .top-bar img {
        height: 25px;
        margin-top: 20px;
      }

      ^ .info-message {
        width: 281px;
        height: 24px;
        font-family: Lato;
        font-size: 16px;
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        line-height: 1.5;
        letter-spacing: normal;
        text-align: center;
        color: #525455;
        margin: auto;
        margin-top: 15px;
      }

      /* This is required for the visibility icon of the confirmed password */
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
        width:100%;
      }
    `,

    properties: [
      {
        name: 'passwordStrength',
        value: 0
      },
      {
        class: 'String',
        name: 'token',
        factory: function() {
          var search = /([^&=]+)=?([^&]*)/g;
          var query  = window.location.search.substring(1);

          var decode = function(s) {
            return decodeURIComponent(s.replace(/\+/g, ' '));
          };

          var params = {};
          var match;

          while ( match = search.exec(query) ) {
            params[decode(match[1])] = decode(match[2]);
          }

          return params.token || null;
        }
      },
      {
        class: 'String',
        name: 'newPassword',
        view: {
          class: 'net.nanopay.ui.NewPasswordView',
          passwordIcon: true
        }
      },
      {
        class: 'String',
        name: 'confirmationPassword',
        view: {
          class: 'foam.u2.view.PasswordView',
          passwordIcon: true
        }
      }
    ],

    messages: [
      { name: 'EMPTY_PASSWORD', message: 'Please enter your new password.' },
      { name: 'EMPTY_CONFIRMATION', message: 'Please re-enter your new password.' },
      { name: 'INVALID_PASSWORD', message: 'Password must be at least 6 characters long.' },
      { name: 'PASSWORD_MISMATCH', message: 'Passwords do not match.' },
      { name: 'RESET_PASSWORD', message: 'Reset your password' },
      { name: 'NEW_PASSWORD_LABEL', message: 'New Password' },
      { name: 'CONFIRM_PASSWORD_LABEL', message: 'Confirm Password' },
      { name: 'PASSWORD_STRENGTH_ERROR', message: 'Your password is not strong enough' },
      { name: 'CREATE_NEW_MESSAGE', message: 'Create a new password for your account' }
    ],

    methods: [
      function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('top-bar')
            .start('img')
              .attr('src', 'images/ablii-wordmark.svg')
            .end()
          .end()
          .start().addClass('Forgot-Password').add(this.RESET_PASSWORD).end()
          .start().addClass('info-message').add(this.CREATE_NEW_MESSAGE).end()
          .start().addClass('Message-Container')
            .start().addClass('Email-Text').add(this.NEW_PASSWORD_LABEL).end()
            .start(this.NEW_PASSWORD, {
              passwordStrength$: this.passwordStrength$
            }).end()
            .start().addClass('Email-Text').add(this.CONFIRM_PASSWORD_LABEL).end()
            .add(this.CONFIRMATION_PASSWORD)
            .start()
              .start(this.CONFIRM, { size: 'LARGE' }).addClass('Next-Button').end()
            .end()
          .end()
      .end();
      }
    ],

    actions: [
      {
        name: 'confirm',
        code: function(X, obj) {
          var self = this;
          // check if new password entered
          if ( ! this.newPassword ) {
            this.add(this.NotificationMessage.create({ message: this.EMPTY_PASSWORD, type: 'error' }));
            return;
          }

          if ( this.passwordStrength < 3 ) {
            this.add(this.NotificationMessage.create({ message: this.PASSWORD_STRENGTH_ERROR, type: 'error' }));
            return false;
          }

          // check if confirm password entered
          if ( ! this.confirmationPassword ) {
            this.add(this.NotificationMessage.create({ message: this.EMPTY_CONFIRMATION, type: 'error' }));
            return;
          }

          // check if passwords match
          if ( ! this.confirmationPassword.trim() || this.confirmationPassword !== this.newPassword ) {
            this.add(this.NotificationMessage.create({ message: this.PASSWORD_MISMATCH, type: 'error' }));
            return;
          }

          var user = this.User.create({
            desiredPassword: this.newPassword
          });

          this.resetPasswordToken.processToken(null, user, this.token).then(function(result) {
            self.stack.push({ class: 'net.nanopay.sme.ui.SuccessPasswordView' });
          }).catch(function(err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        }
      }
    ]
  });
