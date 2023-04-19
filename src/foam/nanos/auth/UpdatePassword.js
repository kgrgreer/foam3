/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'UpdatePassword',

  documentation: 'Update Password Model',

  imports: [
    'auth',
    'notify',
    'resetPasswordToken',
    'subject'
  ],

  requires: [
    'foam.log.LogLevel'
  ],

  messages: [
    { name: 'UPDATE_PASSWORD_TITLE', message: 'Update your password' },
    { name: 'UPDATE_PASSWORD_SUBTITLE', message: 'Create a new password for your account' },
    { name: 'SUCCESS_MSG', message: 'Your password was successfully updated' },
    { name: 'ORIGINAL_PASSWORD_MISSING', message: 'Please enter the original password' },
    { name: 'PASSWORD_LENGTH_10_ERROR', message: 'Password must be at least 10 characters' },
    { name: 'PASSWORD_NOT_MATCH', message: 'Passwords do not match' },
    { name: 'WEAK_PASSWORD_ERR', message: 'Password is weak.' }
  ],

  sections: [
    {
      name: 'resetPasswordSection',
      title: function() {
        return this.UPDATE_PASSWORD_TITLE
      },
      subTitle: function() {
        return this.UPDATE_PASSWORD_SUBTITLE
      }
    }
  ],

  properties: [
    {
      class: 'Password',
      name: 'originalPassword',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true
      },
      validationPredicates: [
        {
          args: ['originalPassword'],
          query: 'originalPassword!=""',
          errorMessage: 'ORIGINAL_PASSWORD_MISSING'
        }
      ]
    },
    {
      class: 'Boolean',
      name: 'passwordAvailable',
      value: true,
      hidden: true
    },
    {
      class: 'Password',
      name: 'newPassword',
      section: 'resetPasswordSection',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.PasswordView',
          isAvailable$: X.data.passwordAvailable$,
          passwordIcon: true
        }
      },
      minLength: 10,
      validationPredicates: [
        {
          args: ['newPassword'],
          query: 'newPassword.len>=10',
          errorMessage: 'PASSWORD_LENGTH_10_ERROR'
        },
        {
          args: ['passwordAvailable'],
          query: 'passwordAvailable==true',
          errorMessage: 'WEAK_PASSWORD_ERR'
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
      value: true,
      hidden: true
    }
  ],

  methods: [
    function init() {
      if ( this.isHorizontal ) {
        this.makeHorizontal();
      };
    },
    {
      name: 'makeHorizontal',
      code: function() {
        this.ORIGINAL_PASSWORD.gridColumns = 4;
        this.NEW_PASSWORD.gridColumns = 4;
        this.CONFIRMATION_PASSWORD.gridColumns = 4;
      }
    },
    {
      name: 'reset_',
      code: function() {
        this.clearProperty('originalPassword');
        this.clearProperty('newPassword');
        this.clearProperty('confirmationPassword');
      }
    }
  ],

  actions: [
    {
      name: 'updatePassword',
      section: 'resetPasswordSection',
      buttonStyle: 'PRIMARY',
      isEnabled: function(errors_) {
        return ! errors_;
      },

      code: function() {
        this.auth.updatePassword(null, this.originalPassword, this.newPassword)
        .then((result) => {
          this.reset_();
          this.notify(this.SUCCESS_MSG, '', this.LogLevel.INFO, true);
        })
        .catch((err) => {
          this.notify(err.message, '', this.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
