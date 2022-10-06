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

  messages: [
    { name: 'CODE_SECTION_TITLE', message: 'Please enter your email verification code' },
    { name: 'RESET_PASSWORD_TITLE', message: 'Reset your password' },
    { name: 'RESET_PASSWORD_SUBTITLE', message: 'Create a new password for your account' }
  ],

  sections: [
    {
      name: 'verificationCodeSection',
      title: function() {
        return this.CODE_SECTION_TITLE
      }
    },
    {
      name: 'resetPasswordSection',
      title: function() {
        return this.RESET_PASSWORD_TITLE
      },
      subTitle: function() {
        return this.RESET_PASSWORD_SUBTITLE
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'email',
      hidden: true
    },
    {
      class: 'String',
      name: 'resetPasswordCode',
      section: 'verificationCodeSection',
      required: true,
      view: function(_, X) {
        return X.data.FragmentedTextField.create({
          delegates: [
            X.data.FragmentedTextFieldFragment.create({ maxLength: 1 }, X),
            '-',
            X.data.FragmentedTextFieldFragment.create({ maxLength: 1 }, X),
            '-',
            X.data.FragmentedTextFieldFragment.create({ maxLength: 1 }, X),
            '-',
            X.data.FragmentedTextFieldFragment.create({ maxLength: 1 }, X)
          ]
        }, X);
      }
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
    }
  ]
});
