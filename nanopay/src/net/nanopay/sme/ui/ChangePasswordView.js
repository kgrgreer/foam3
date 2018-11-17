/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
    package: 'net.nanopay.sme.ui',
    name: 'ChangePasswordView',
    extends: 'foam.u2.Controller',
  
    documentation: 'Forgot Password Reset View',
  
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
        margin-top: 32px;
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
  
    messages: [
      { name: 'noSpaces', message: 'Password cannot contain spaces' },
      { name: 'noNumbers', message: 'Password must have one numeric character' },
      { name: 'noSpecial', message: 'Password must not contain: !@#$%^&*()_+' },
      { name: 'emptyPassword', message: 'Please enter new your password' },
      { name: 'emptyConfirmation', message: 'Please re-enter your new password' },
      { name: 'invalidLength', message: 'Password must be 7-32 characters long' },
      { name: 'passwordMismatch', message: 'Passwords do not match' }
    ],
  
    properties: [
      {
        class: 'String',
        name: 'token',
        factory: function () {
          var search = /([^&=]+)=?([^&]*)/g;
          var query  = window.location.search.substring(1);
  
          var decode = function (s) {
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
        view: { class: 'foam.u2.view.PasswordView' }
      },
      {
        class: 'String',
        name: 'confirmPassword',
        view: { class: 'foam.u2.view.PasswordView' }
      }
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
          .start().addClass('Forgot-Password').add("Reset your password").end()
          .start().addClass('Message-Container')
            .start().addClass('Email-Text').add("New Password").end()
            .add(this.NEW_PASSWORD)
            .start().addClass('Email-Text').add("Confirm Password").end()
            .add(this.CONFIRM_PASSWORD)
            .start('div')
              .start(this.CONFIRM).addClass('Next-Button').end()
            .end()
          .end()
      .end()
      }
    ],
  
    actions: [
      {
        name: 'confirm',
        code: function (X, obj) {
          var self = this;
          // check if new password entered
          if ( ! this.newPassword ) {
            this.add(this.NotificationMessage.create({ message: this.emptyPassword, type: 'error' }));
            return;
          }
  
          if ( this.newPassword.includes(' ') ) {
            this.add(this.NotificationMessage.create({ message: this.noSpaces, type: 'error' }));
            return;
          }
  
          if ( this.newPassword.length < 7 || this.newPassword.length > 32 ) {
            this.add(this.NotificationMessage.create({ message: this.invalidLength, type: 'error' }));
            return;
          }
  
          if ( ! /\d/g.test(this.newPassword) ) {
            this.add(self.NotificationMessage.create({ message: this.noNumbers, type: 'error' }));
            return;
          }
  
          if ( /[^a-zA-Z0-9]/.test(this.newPassword) ) {
            this.add(self.NotificationMessage.create({ message: this.noSpecial, type: 'error' }));
            return;
          }
  
          // check if confirm password entered
          if ( ! this.confirmPassword ) {
            this.add(self.NotificationMessage.create({ message: this.emptyConfirmation, type: 'error' }));
            return;
          }
  
          // check if passwords match
          if ( ! this.confirmPassword.trim() || this.confirmPassword !== this.newPassword ) {
            this.add(self.NotificationMessage.create({ message: this.passwordMismatch, type: 'error' }));
            return;
          }
  
          var user = this.User.create({
            desiredPassword: this.newPassword
          });
  
          this.resetPasswordToken.processToken(null, user, this.token).then(function (result) {
            self.stack.push({ class: 'foam.nanos.auth.resetPassword.SuccessView' });
          }).catch(function (err) {
            self.add(self.NotificationMessage.create({ message: err.message, type: 'error' }));
          });
        }
      }
    ]
  });
  