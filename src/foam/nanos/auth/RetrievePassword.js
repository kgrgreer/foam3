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
    'loginView?',
    'resetPasswordService',
    'resetPasswordToken',
    'stack',
    'translationService'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.DuplicateEmailException',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserNotFoundException',
    'foam.u2.dialog.NotificationMessage'
  ],

  messages: [
    { name: 'TOKEN_INSTRUC_TITLE',      message: 'Password Reset Instructions Sent' },
    { name: 'TOKEN_INSTRUC',            message: 'Please check your inbox to continue' },
    { name: 'CODE_INSTRUC_TITLE',       message: 'Verification code sent' },
    { name: 'CODE_INSTRUC',             message: 'Please check your inbox to reset your password' },
    { name: 'REDIRECTION_TO',           message: 'Back to Sign in' },
    { name: 'DUPLICATE_ERROR_MSG',      message: 'This account requires username' },
    { name: 'ERROR_MSG',                message: 'Issue resetting your password. Please try again' },
    { name: 'USER_NOT_FOUND_ERROR_MSG', message: 'Unabled to find user with email: '}
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
      createVisibility: function(usernameRequired, readOnlyIdentifier) {
       return usernameRequired ? foam.u2.DisplayMode.HIDDEN :
        readOnlyIdentifier ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      }
    },
    {
      class: 'Boolean',
      name: 'readOnlyIdentifier',
      hidden: true
    },
    {
      class: 'String',
      name: 'username',
      createVisibility: function(usernameRequired) {
       return usernameRequired ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validateObj: function(usernameRequired, username) {
        return usernameRequired && ! username ? 'Username is required.' : '';
      },
      section: 'emailPasswordSection'
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
    },
    {
      class: 'Boolean',
      name: 'showSubmitAction',
      value: true,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'resetByCode',
      hidden: true
    }
  ],

  actions: [
    {
      name: 'sendEmail',
      label: 'Submit',
      buttonStyle: 'PRIMARY',
      section: 'emailPasswordSection',
      isAvailable: function(showSubmitAction) {
        return showSubmitAction
      },
      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: async function(X) {
        var instructionTitle, instruction;
        try {
          if ( this.resetByCode ) {
            await this.resetPasswordService.resetPasswordByCode(null, this.email, this.username);
            instructionTitle = this.CODE_INSTRUC_TITLE;
            instruction = this.CODE_INSTRUC;
          } else {
            const user = await this.User.create({ email: this.email, userName: this.username });
            await this.resetPasswordToken.generateToken(null, user);
            instructionTitle = this.TOKEN_INSTRUC_TITLE;
            instruction = this.TOKEN_INSTRUC;
          }

          this.ctrl.add(this.NotificationMessage.create({
            message: instructionTitle,
            description: instruction,
            type: this.LogLevel.INFO,
            transient: true
          }));
          this.stack.push({ ...(this.loginView ?? { class: 'foam.u2.view.LoginView' }), mode_: 'SignIn' }, this);
        } catch(err) {
          var msg = this.ERROR_MSG;
          if ( this.UserNotFoundException.isInstance(err.data.exception) ) {
            msg = this.USER_NOT_FOUND_ERROR_MSG + this.email;
          }
          if ( this.DuplicateEmailException.isInstance(err.data.exception) ) {
            this.usernameRequired = true;
            msg = this.DUPLICATE_ERROR_MSG;
          }
          this.ctrl.add(this.NotificationMessage.create({
            message: msg,
            type: this.LogLevel.ERROR,
            transient: true
          }));
          throw err;
        }
      }
    }
  ]
});
