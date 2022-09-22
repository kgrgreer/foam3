/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'RetrievePassword',

  documentation: 'Forgot Password Resend Model',

  imports: [
    'ctrl',
    'loginVariables',
    'resetPasswordToken',
    'stack',
    'theme',
    'translationService',
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.nanos.auth.UserNotFoundException',
    'foam.nanos.auth.DuplicateEmailException'
  ],

  messages: [
    { name: 'INSTRUC_TITLE', message: 'Password Reset Instructions Sent' },
    { name: 'INSTRUC', message: 'Please check your inbox to continue' },
    { name: 'REDIRECTION_TO', message: 'Back to Sign in' },
    { name: 'DUPLICATE_ERROR_MSG', message: 'This account requires username' },
    { name: 'ERROR_MSG', message: 'Issue resetting your password. Please try again' },
  ],

  sections: [
    {
      name: 'emailPasswordSection',
      title: 'Forgot your password?',
      subTitle: 'Enter the email you signed up with and we\'ll send you a link to reset your password.',
      help: 'Enter your account email and we will send you an email with a link to create a new one.'
    }
  ],


  properties: [
    {
      class: 'EMail',
      name: 'email',
      section: 'emailPasswordSection',
      required: true,
      createVisibility: function(usernameRequired) {
       return usernameRequired ? foam.u2.DisplayMode.HIDDEN : foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'String',
      name: 'username',
      createVisibility: function(usernameRequired) {
       return usernameRequired ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      section: 'emailPasswordSection',
    },
    {
      class: 'Boolean',
      name: 'usernameRequired',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'hasBackLink',
      documentation: 'checks if back link to login page is needed',
      value: true,
      hidden: true
    }
  ],

  actions: [
    {
      name: 'sendEmail',
      label: 'Submit',
      buttonStyle: 'PRIMARY',
      section: 'emailPasswordSection',

      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: function(X) {
        const user = this.User.create({ email: this.email, userName: this.username });
        this.resetPasswordToken.generateToken(null, user).then((_) => {
          this.ctrl.add(this.NotificationMessage.create({
            message: `${this.INSTRUC_TITLE}`,
            description: `${this.INSTRUC}`,
            type: this.LogLevel.INFO,
            transient: true
          }));
          this.stack.push({ ...(this.loginVariables?.loginView ?? { class: 'foam.u2.view.LoginView' }), mode_: 'SignIn' }, this);
        }).catch((err) => {
          if ( this.UserNotFoundException.isInstance(err.data.exception) ) {
              this.ctrl.add(this.NotificationMessage.create({
                err: err.data,
                type: this.LogLevel.ERROR,
                transient: true
              }));
              return;
          }
          var msg = this.ERROR_MSG;
          if ( this.DuplicateEmailException.isInstance(err.data.exception) ) {
            this.usernameRequired = true;
            msg = this.DUPLICATE_ERROR_MSG;
          }
          this.ctrl.add(this.NotificationMessage.create({
            message: msg,
            type: this.LogLevel.ERROR,
            transient: true
          }));
        });
      }
    }
  ]
});
