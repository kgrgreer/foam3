/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ResetPassword',

  documentation: 'Reset Password Model',

  imports: [
    'auth',
    'ctrl',
    'notify',
    'resetPasswordToken',
    'stack',
    'user'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.stack.StackBlock'
  ],

  messages: [
    { name: 'RESET_PASSWORD_TITLE', message: 'Reset your password' },
    { name: 'RESET_PASSWORD_SUBTITLE', message: 'Create a new password for your account' },
    { name: 'SUCCESS_MSG', message: 'Your password was successfully updated' },
    { name: 'SUCCESS_MSG_TITLE', message: 'Success' },
    { name: 'PASSWORD_LENGTH_10_ERROR', message: 'Password must be at least 10 characters' },
    { name: 'PASSWORD_NOT_MATCH', message: 'Passwords do not match' },
    { name: 'ERROR_MSG', message: 'There was a problem resetting your password' },
  ],

  sections: [
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
      class: 'String',
      name: 'token',
      factory: function() {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('token');
      },
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isHorizontal',
      documentation: 'setting this to true makes password fields to be displayed horizontally',
      value: false,
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
  ],

  actions: [
    {
      name: 'resetPassword',
      label: 'Confirm',
      section: 'resetPasswordSection',
      isEnabled: function(errors_) {
        return ! errors_;
      },
      code: function() {
        const user = this.User.create({
          desiredPassword: this.newPassword
        });

        this.resetPasswordToken.processToken(null, user, this.token)
        .then((_) => {
          this.finalRedirectionCall();

          this.ctrl.add(this.NotificationMessage.create({
            message: this.SUCCESS_MSG_TITLE,
            description: this.SUCCESS_MSG,
            type: this.LogLevel.INFO,
            transient: true
          }));
        }).catch((err) => {
          this.ctrl.add(this.NotificationMessage.create({
              err: err.data,
              message: this.ERROR_MSG,
              type: this.LogLevel.ERROR,
              transient: true
            }));
        });
      }
    }
  ]
});
