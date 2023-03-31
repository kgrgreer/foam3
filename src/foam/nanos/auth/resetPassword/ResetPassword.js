/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ResetPassword',

  documentation: 'Reset Password Base Model',

  messages: [
    { name: 'TITLE', message: 'Reset your password' },
    { name: 'INSTRUCTION', message: 'Create a new password for your account' },
    { name: 'PASSWORD_LENGTH_10_ERROR', message: 'Password must be at least 10 characters' },
    { name: 'PASSWORD_NOT_MATCH', message: 'Passwords do not match' },
    { name: 'SUCCESS_MSG', message: 'Your password was successfully updated' },
    { name: 'SUCCESS_MSG_TITLE', message: 'Success' },
    { name: 'ERROR_MSG', message: 'There was a problem resetting your password' }
  ],

  sections: [
    {
      name: 'resetPasswordSection'
    }
  ],

  properties: [
    {
      class: 'Password',
      name: 'newPassword',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      minLength: 10,
      validationPredicates: [
        {
          args: ['newPassword'],
          query: 'newPassword.len>=10',
          errorMessage: 'PASSWORD_LENGTH_10_ERROR'
        }
      ]
    },
    {
      class: 'Password',
      name: 'confirmationPassword',
      label: 'Confirm Password',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      validationPredicates: [
        {
          args: ['newPassword', 'confirmationPassword'],
          query: 'newPassword==confirmationPassword',
          errorMessage: 'PASSWORD_NOT_MATCH'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'isHorizontal',
      documentation: 'setting this to true makes password fields to be displayed horizontally',
      value: false,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'showSubmitAction',
      value: true,
      hidden: true
    }
  ],

  methods: [
    function init() {
      if ( this.isHorizontal ) {
        this.makeHorizontal();
      }
    },
    {
      name: 'makeHorizontal',
      code: function() {
        this.NEW_PASSWORD.gridColumns = 6;
        this.CONFIRMATION_PASSWORD.gridColumns = 6;
      }
    },
    {
      name: 'finalRedirectionCall',
      code: function() {
        window.history.replaceState(null, null, window.location.origin);
        location.reload();
      }
    }
  ]
});
