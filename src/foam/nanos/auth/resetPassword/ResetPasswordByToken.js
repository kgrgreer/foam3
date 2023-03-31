
  /**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth.resetPassword',
  name: 'ResetPasswordByToken',
  extends: 'foam.nanos.auth.resetPassword.ResetPassword',

  documentation: 'Reset Password By Token Model',

  imports: [
    'ctrl',
    'resetPasswordToken',
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  properties: [
    {
      class: 'String',
      name: 'token',
      factory: function() {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('token');
      },
      hidden: true
    }
  ],

  actions: [
    {
      name: 'resetPassword',
      label: 'Confirm',
      buttonStyle: 'PRIMARY',
      section: 'resetPasswordSection',
      isEnabled: function(errors_) {
        return ! errors_;
      },
      isAvailable: function(showSubmitAction) {
        return showSubmitAction
      },
      code: function(X) {
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
