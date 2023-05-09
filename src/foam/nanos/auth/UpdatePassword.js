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
    { name: 'TITLE', message: 'Update your password' },
    { name: 'INSTRUCTION', message: 'Create a new password for your account' },
    { name: 'SUCCESS_MSG', message: 'Your password was successfully updated' },
    { name: 'ORIGINAL_PASSWORD_MISSING', message: 'Please enter the original password' },
    { name: 'PASSWORD_LENGTH_10_ERROR', message: 'Password must be at least 10 characters' },
    { name: 'PASSWORD_NOT_MATCH', message: 'Passwords do not match' },
    { name: 'WEAK_PASSWORD_ERR', message: 'Password is weak.' }
  ],

  sections: [
    {
      name: 'resetPasswordSection',
<<<<<<< HEAD
      title: function() {
        return this.UPDATE_PASSWORD_TITLE
      },
      subTitle: function() {
        return this.UPDATE_PASSWORD_SUBTITLE
      }
=======
>>>>>>> refs/heads/development
    }
  ],

  properties: [
    {
      class: 'Password',
      name: 'originalPassword',
      section: 'resetPasswordSection',
      view: {
        class: 'foam.u2.view.PasswordView',
        passwordIcon: true,
        autocomplete: 'current-password'
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
          passwordIcon: true,
          autocomplete: 'new-password'
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
        passwordIcon: true,
        autocomplete: 'new-password'
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
        let columns = { columns: 12, mdColumns: 4, lgColumns: 4, xlColumns: 4 };
        this.ORIGINAL_PASSWORD.gridColumns = columns;
        this.NEW_PASSWORD.gridColumns = columns;
        this.CONFIRMATION_PASSWORD.gridColumns = columns;
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
