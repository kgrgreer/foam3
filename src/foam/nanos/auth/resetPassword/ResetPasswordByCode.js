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
