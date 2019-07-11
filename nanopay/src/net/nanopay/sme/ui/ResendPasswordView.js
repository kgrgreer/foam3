foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'ResendPasswordView',
    extends: 'foam.u2.Controller',
  
    documentation: 'Ablii Forgot Password Resend View',
  
    imports: [
      'resetPasswordToken',
      'stack'
    ],
  
  
    requires: [
      'foam.nanos.auth.User',
      'foam.u2.dialog.NotificationMessage'
    ],
  
    css:`
    ^{
        margin: auto;
        text-align: center;
        background: #fff;
        min-height: 100vh;
        width: 100%;
        font-family: lato;
        font-size: 16px;
      }
  
      ^ .Message-Container{
        width: 400px;
        border-radius: 2px;
        padding: 10px 0px;
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
        margin-bottom: 64px;
        padding-top: 160px;
      }
  
      ^ p{
        display: inline-block;
      }

  
      ^ .Instructions-Text{
        height: 16px;
        display: inline-block;
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
        margin-bottom: 32px;
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
  
      ^ .Resend-Button{
        width: 168px;
        height: 40px;
        border-radius: 2px;
        background-color: /*%PRIMARY3%*/ #406dea;
        margin-left: 20px;
        margin-right: 20px;
        margin-bottom: 20px;
        margin-top: 10px;
        text-align: center;
        color: #ffffff;
        font-family: Lato;
        font-size: 16px;
        line-height: 2.86;
        cursor: pointer;
        width: 128px;
        height: 48px;
        border-radius: 4px;
        box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
        border: solid 1px #4a33f4;
        background-color: #604aff;
      }

      ^ [name="resendEmail"] {
        margin-left: 5px;
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
    `,

    properties: [
      {
        class: 'String',
        name: 'email'
      }
    ],

    messages: [
      { name: 'INSTRUCTIONS', message: 'A password reset link was sent to: ' },
      { name: 'FORGOT_PASSWORD', message: 'Forgot your password?' },
      { name: 'NO_EMAIL', message: 'Don\'t see the email?' },
      { name: 'BACK_TO_SIGN_IN', message: 'Back to sign in' },
      { name: 'SUCCESS_MESSAGE', message: 'Password reset instructions sent to ' }
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
            .start().addClass('Message-Container')
              .start().addClass('Instructions-Text').add(this.INSTRUCTIONS, this.email).end()
              .start().add(this.NO_EMAIL).addClass('Instructions-Text').end()
              .start(this.RESEND_EMAIL, { buttonStyle: 'UNSTYLED' })
                .addClass('sme')
                .addClass('link')
              .end()
            .end()
            .start().addClass('sme').addClass('link')
              .add(this.BACK_TO_SIGN_IN)
              .on('click', function() {
                self.stack.push({
                  class: 'net.nanopay.sme.ui.SignInView'
                });
              })
            .end()
          .end();
      }
    ],

    actions: [
      {
        name: 'resendEmail',
        label: 'Resend it',
        code: function(X) {
          var self = this;

          var user = this.User.create({ email: this.email });
          this.resetPasswordToken.generateToken(null, user).then(function(result) {
            self.add(self.NotificationMessage.create({ message: self.SUCCESS_MESSAGE + self.email }));
          })
          .catch(function(err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        }
      }
    ]
  });
