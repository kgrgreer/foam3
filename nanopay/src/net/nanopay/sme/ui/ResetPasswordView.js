/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'ResetPasswordView',
    extends: 'foam.u2.Controller',
  
    documentation: 'Forgot Password Email View',
  
    imports: [
      'resetPasswordToken',
      'stack'
    ],
  
    requires: [
      'foam.nanos.auth.resetPassword.ResendView',
      'foam.nanos.auth.User',
      'foam.u2.dialog.NotificationMessage'
    ],
  
    css:`
      ^{
        margin: auto;
        text-align: center;
        background: #fff;
        height: 100%;
        width: 100%;
      }
  
      ^ .Message-Container{
        width: 330px;
        height: 215px;
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
        color: #093649;
        text-align: center;
        font-weight: 900;
        margin-bottom: 8px;
        padding-top: 160px;
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
        color: #093649;
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
        color: #093649;
        font-weight: 300;
        letter-spacing: 0.2px;
        border-radius: 3px;
        box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
        border: solid 1px #8e9090;
        margin-bottom: 32px;
      }
  
      ^ .Next-Button{
        width: 168px;
        height: 40px;
        border-radius: 2px;
        background-color: %SECONDARYCOLOR%;
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
        class: 'EMail',
        name: 'email'
      },
      {
        class: 'foam.u2.ViewSpec',
        name: 'signInView',
        factory: function() {
          return { class: 'foam.nanos.auth.SignInView'};
        }
      }
    ],
  
    messages: [
      { name: 'Instructions', message: "Enter the email you signed up with and we'll send you a link to create a new one"}
    ],
  
    methods: [
      function initE(){
      this.SUPER();
      var self = this;
  
      this
        .addClass(this.myClass())
        .start()
            .start()
                .addClass('top-bar')
                .start('img')
                    .attr('src', 'images/ablii-wordmark.svg')
                .end()
            .end()
          .start().addClass('Forgot-Password').add('Forgot your password?').end()
          .start().addClass('Instructions-Text').add(this.Instructions).end()
          .start().addClass('Message-Container')
          .start().addClass('Email-Text').add("Email Address").end()
          .start(this.EMAIL).addClass('input-box').end()
          .start(this.NEXT).addClass('Next-Button').end()
          .br()
          .start('p').addClass('link')
            .add('Back to sign in')
            .on('click', function() {
              self.stack.push( self.signInView );
            })
          .end()
        .end();
      }
    ],
  
    actions: [
      {
        name: 'next',
        code: function (X) {
          var self = this;
          var user = this.User.create({ email: this.email });
          this.resetPasswordToken.generateToken(null, user).then(function (result) {
            if ( ! result ) {
              throw new Error('Error generating reset token');
            }
            self.stack.push(self.ResendView.create({ email: self.email }));;
          })
          .catch(function (err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        }
      }
    ]
  });
  