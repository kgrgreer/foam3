foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'ResetPasswordView',
    extends: 'foam.u2.Controller',

    documentation: 'Ablii Forgot Password Email View',

    imports: [
      'ctrl',
      'notify',
      'resetPasswordToken',
      'stack',
      'validateEmail'
    ],

    requires: [
      'foam.nanos.auth.resetPassword.ResendView',
      'foam.nanos.auth.User',
      'foam.u2.dialog.NotificationMessage'
    ],

    css: `
      ^ {
        margin: auto;
        text-align: center;
        background: #fff;
        min-height: 100vh;
        width: 100%;
      }

      ^ .Message-Container {
        width: 330px;
        height: 215px;
        border-radius: 2px;
        padding-top: 5px;
        margin: auto;
      }

      ^ .Forgot-Password {
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
        padding-top: 160px;
      }

      ^ p {
        display: inline-block;
      }

      ^ .link{
        margin: auto;
      }

      ^ .Instructions-Text {
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

      ^ .Email-Text {
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

      ^ .input-Box {
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
        margin-bottom: 5px;
      }

      ^ .Submit-Button {
        margin-bottom: 20px;
        margin-top: 20px;
        font-family: Lato;
        font-size: 16px;
        width: 128px;
        height: 48px;
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

      ^ .invisible {
        display: none;
      }

      ^ .bar , .bar.invisble {
        color: #f91c1c;
        display: block;
        height: 20px;
        font-family: Lato;
        font-size: 12px;
        line-height: 1.2
        font-weight: normal;
        font-style: normal;
        font-stretch: normal;
        letter-spacing: normal;
        text-align: left;
      }

      ^ .invalidEmail {
        background-color: #fff7f7;
        border-color: #f91c1c;
      }

      ^ .error-image {
        height: auto;
        width: auto;
        max-width: 13px;
        max-height: 13px;
      }
    `,

    properties: [
      {
        class: 'EMail',
        name: 'email'
      },
      {
        class: 'Boolean',
        name: 'invalidEmail'
      }
    ],

    messages: [
      { name: 'INSTRUCTIONS',    message: 'Enter the email you signed up with and we\'ll send you a link to create a new one' },
      { name: 'FORGOT_PASSWORD', message: 'Forgot your password?' },
      { name: 'EMAIL_LABEL',     message: 'Email Address' },
      { name: 'BACK_TO_SIGN_IN', message: 'Back to sign in' },
      { name: 'SUCCESS_MESSAGE', message: 'Password reset instructions sent to ' },
      { name: 'INVALID_EMAIL',   message: ' Please enter a valid email.' }
    ],

    methods: [
      function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('top-bar')
            .start('img')
              .attr('src', 'images/ablii-wordmark.svg')
            .end()
          .end()
          .start().addClass('Forgot-Password').add(this.FORGOT_PASSWORD).end()
          .start().addClass('Instructions-Text').add(this.INSTRUCTIONS).end()
          .start().addClass('Message-Container')
          .start().addClass('Email-Text').add(this.EMAIL_LABEL).end()
          .start(this.EMAIL).addClass('input-box')
            .enableClass('invalidEmail', this.invalidEmail$).end()
          .start()
            .start('img')
              .attr('src', 'images/inline-error-icon.svg')
              .addClass('error-image')
            .end()
            .add(this.INVALID_EMAIL)
            .addClass('invisible')
            .enableClass('bar', this.invalidEmail$)
          .end().br()
          .start(this.SUBMIT).addClass('Submit-Button').end()
          .br()
          .start('p').addClass('sme').addClass('link')
            .add(this.BACK_TO_SIGN_IN)
            .on('click', function() {
              self.stack.push({class: 'net.nanopay.sme.ui.SignInView'});
            })
          .end()
        .end();
      }
    ],

    actions: [
      {
        name: 'submit',
        code: function(X) {
          if ( ! this.validateEmail(this.email) ) {
            this.invalidEmail = true;
            return;
          }
  
          this.invalidEmail = false;
          var user = this.User.create({ email: this.email });
          this.resetPasswordToken.generateToken(null, user).then(
            (result) => {
              if ( ! result ) {
                throw new Error('Error generating reset token');
              }
              this.ctrl.notify(this.SUCCESS_MESSAGE + this.email);
              this.stack.push(this.ResendView.create({ email: this.email }));
          })
          .catch(function(err) {
            this.ctrl.notify(err.message, 'error');
          });
        }
      }
    ]
  });
