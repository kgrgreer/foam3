/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ResetPasswordByCode',
  extends: 'foam.nanos.auth.resetPassword.ResetPassword',

  documentation: 'Reset Password By Code Model',

  imports: [
    'ctrl',
    'resetPasswordService'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.FragmentedTextField',
    'foam.u2.FragmentedTextFieldFragment'
  ],

  sections: [
    {
      name: 'verificationCodeSection'
    },
    {
      name: 'resetPasswordSection'
    }
  ],

  messages: [
    { name: 'INSTRUC_TITLE',    message: 'Verification code sent' },
    { name: 'INSTRUC',          message: 'Please check your inbox to verify your email' },
    { name: 'RESEND_ERROR_MSG', message: 'There was an issue resending your verification code' }
  ],

  properties: [
    {
      class: 'String',
      name: 'email',
      hidden: true
    },
    {
      class: 'String',
      name: 'userName',
      hidden: true
    },
    {
      class: 'String',
      name: 'resetPasswordCode',
      section: 'verificationCodeSection',
      required: true,
      view: function(_, X) {
        var delegates = Array(6).fill(X.data.FragmentedTextFieldFragment.create({ maxLength: 1 }, X));
        delegates = [].concat(...delegates.map(n => [n, '-'])).slice(0, -1);
        return X.data.FragmentedTextField.create({ delegates: delegates }, X);
      }
    },
    {
      name: 'newPassword',
      section: 'resetPasswordSection'
    },
    {
      name: 'confirmationPassword',
      section: 'resetPasswordSection'
    }
  ],

  actions: [
    {
      name: 'resetPassword',
      label: 'Confirm',
      section: 'resetPasswordSection',
      isEnabled: function (errors_) {
        return ! errors_;
      },
      isAvailable: function (showSubmitAction) {
        return showSubmitAction
      },
      code: async function (X) {
        try {
          await this.resetPasswordService.resetPassword(null, this);
        } catch (err) {
          this.ctrl.add(this.NotificationMessage.create({
            err: err.data,
            message: this.ERROR_MSG,
            type: this.LogLevel.ERROR,
            transient: true
          }));
          throw err;
        }
        this.ctrl.add(this.NotificationMessage.create({
          message: this.SUCCESS_MSG_TITLE,
          description: this.SUCCESS_MSG,
          type: this.LogLevel.INFO,
          transient: true
        }));
      }
    },
    {
      name: 'resendCode',
      label: 'Resend Code',
      section: 'verificationCodeSection',
      buttonStyle: 'LINK',
      code: async function(X) {
        try {
          await this.resetPasswordService.resetPasswordByCode(null, this.email, this.username);

          this.ctrl.add(this.NotificationMessage.create({
            message: this.INSTRUC_TITLE,
            description: this.INSTRUC,
            type: this.LogLevel.INFO,
            transient: true
          }));
        } catch(err) {
          if ( this.UserNotFoundException.isInstance(err.data.exception) ) {
              this.ctrl.add(this.NotificationMessage.create({
                err: err.data,
                type: this.LogLevel.ERROR,
                transient: true
              }));
              return;
          }
          this.ctrl.add(this.NotificationMessage.create({
            message: this.RESEND_ERROR_MSG,
            type: this.LogLevel.ERROR,
            transient: true
          }));
          throw err;
        }
      }
    }
  ]
});
