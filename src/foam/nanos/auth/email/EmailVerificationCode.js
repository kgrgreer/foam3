/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'EmailVerificationCode',
  ids: [ 'email' ],

  mixins: [
    'foam.nanos.auth.CreatedAware',
    'foam.nanos.auth.LastModifiedAware'
  ],

  documentation: 'Model used to verify user email by code',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.FragmentedTextField',
    'foam.u2.FragmentedTextFieldFragment'
  ],

  imports: [
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
    },
    {
      class: 'String',
      name: 'email',
      required: true,
      hidden: true
    },
    {
      class: 'DateTime',
      name: 'expiry',
      hidden: true
    }
  ],

  actions: [
    {
      name: 'submit',
      code: async function(X) {
        var data = X.data.data;
        var success;
        try {
          success = await X.emailVerificationService.verifyCode(X, data.email, data.verificationCode);
        } catch ( err ) {
          X.data.ctrl.add(data.NotificationMessage.create({
            message: data.ERROR_MSG,
            type: data.LogLevel.ERROR,
            err: err.data
          }));
        }          
        if ( success ) {
          X.data.ctrl.add(data.NotificationMessage.create({
            message: data.SUCCESS_MSG,
            type: data.LogLevel.INFO
          }));
          window.location.reload();
        } else {
          X.data.ctrl.add(data.NotificationMessage.create({
            message: data.ERROR_MSG,
            type: data.LogLevel.ERROR
          }));
        }
      }
    }
  ]
});
