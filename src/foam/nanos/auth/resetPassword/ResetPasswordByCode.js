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
    'emailVerificationService',
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
      name: 'resetPasswordSection',
      isAvailable: function(codeVerified) {
        return codeVerified;
      }
    }
  ],

  messages: [
    { name: 'EMPTY_CODE',       message: 'Please enter the 6-digit code sent to your email' },
    { name: 'INVALID_CODE',     message: 'The code you have entered is invalid. Please re-enter your code or request a new code.' }
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
      },
      validationPredicates: [
        {
          args: ['resetPasswordCode'],
          query: 'resetPasswordCode.len==6',
          errorMessage: 'EMPTY_CODE'
        },
        {
          args: ['resetPasswordCode', 'codeVerified'],
          query: 'codeVerified==true',
          errorMessage: 'INVALID_CODE'
        }
      ]
    },
    {
      name: 'newPassword',
      section: 'resetPasswordSection'
    },
    {
      name: 'confirmationPassword',
      section: 'resetPasswordSection'
    },
    {
      class: 'Boolean',
      name: 'codeVerified',
      documentation: `
        Updated by verifyCode method whenever code is updated and of valid format.
      `
    }
  ],

  methods: [
    function init() {
      this.onDetach(this.resetPasswordCode$.sub(() => this.verifyCode()));
    }
  ],

  listeners: [
    {
      name: 'verifyCode',
      mergeDelay: 100,
      code: async function() {
        if ( ! this.resetPasswordCode || this.resetPasswordCode.length != 6 ) {
          this.codeVerified = false;
          return;
        }
        // call server to verify code
        try {
          var verified = await  this.emailVerificationService.verifyCode(x, this.email, this.userName, this.resetPasswordCode);
          this.codeVerified = verified;
        } catch (error) {
          this.codeVerified = false;
        }
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