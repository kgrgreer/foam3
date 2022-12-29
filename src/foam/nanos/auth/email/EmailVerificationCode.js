/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailVerificationCode',
  ids: [ 'email', 'userName' ],

  mixins: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  documentation: 'Model used to verify user email by code',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.FragmentedTextField',
    'foam.u2.FragmentedTextFieldFragment'
  ],

  imports: [
    'ctrl',
    'emailVerificationService'
  ],

  messages: [
    { name: 'SUCCESS_MSG', message: 'Email verified.' },
    { name: 'ERROR_MSG', message: 'Email verification failed.' },
    { name: 'TITLE', message: 'Please enter your email verification code' }
  ],

  properties: [
    {
      class: 'String',
      name: 'verificationCode',
      required: true,
      view: function(_, X) {
        var delegates = Array(6).fill(X.data.FragmentedTextFieldFragment.create({ maxLength: 1 }, X));
        delegates = [].concat(...delegates.map(n => [n, '-'])).slice(0, -1);
        return X.data.FragmentedTextField.create({ delegates: delegates }, X);
      }
    },
    {
      class: 'String',
      name: 'email',
      required: true,
      hidden: true
    },
    {
      class: 'String',
      name: 'userName',
      required: true,
      hidden: true
    },
    {
      class: 'DateTime',
      name: 'expiry',
      hidden: true
    },
    {
      class: 'Int',
      name: 'maxAttempts',
      value: 5,
      hidden: true
    },
    {
      class: 'Int',
      name: 'verificationAttempts',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'showAction',
      hidden: true
    }
  ],

  actions: [
    {
      name: 'submit',
      isAvailable: function(showAction) {
        return showAction;
      },
      code: async function() {
        var success, err;
        try {
          success = await this.emailVerificationService.verifyUserEmail(null, this.email, this.userName, this.verificationCode);
        } catch ( error ) {
          err = error;
        }
        if ( success ) {
          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_MSG,
            type: this.LogLevel.INFO
          }));
        } else {
          this.ctrl.add(this.NotificationMessage.create({
            message: this.ERROR_MSG,
            type: this.LogLevel.ERROR,
            err: err?.data
          }));
          throw err;
        }
      }
    },
    {
      name: 'resendCode',
      buttonStyle: 'LINK',
      code: async function() {
        try {
          await this.emailVerificationService.verifyByCode(null, this.email, this.userName, '');
          this.ctrl.add(this.NotificationMessage.create({
            message: this.VERIFICATION_EMAIL_TITLE,
            description: this.VERIFICATION_EMAIL+ ' ' + this.email,
            type: this.LogLevel.INFO
          }));
          return true;
        } catch ( err ) {
          this.ctrl.add(this.NotificationMessage.create({
            err: err.data,
            message: this.ERROR_MSG_EMAIL,
            type: this.LogLevel.ERROR
          }));
          return false;
        }
      }
    }
  ]
});
