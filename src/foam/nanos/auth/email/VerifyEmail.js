/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.auth.email',
  name: 'VerifyEmail',
  implements: [ 'foam.mlang.Expressions' ],

  documentation: 'Forgot Password Resend Model',

  imports: [
    'ctrl',
    'emailToken',
    'loginVariables',
    'notify',
    'userDAO'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage'
  ],

  sections: [
    {
      name: 'emailSection',
      title: 'Verify your Email',
      subTitle: 'Your email has not been verified yet. Please verify your email to continue.'
    }
  ],


  properties: [
    {
      class: 'EMail',
      name: 'email',
      section: 'emailSection',
      required: true,
      factory: function() {
        return this.loginVariables.identifier;
      },
      createVisibility: 'DISABLED'
    },
    {
      class: 'Boolean',
      name: 'showAction',
      hidden: true
    }
  ],

  actions: [
    {
      name: 'sendEmail',
      label: 'Send Verification Email',
      buttonStyle: 'PRIMARY',
      section: 'emailSection',
      isEnabled: function(errors_) {
        return ! errors_;
      },
      isAvailable: function(showAction) {
        return showAction;
      },
      code: async function() {
        var self = this;
        var user = await this.userDAO.find(this.EQ(this.User.EMAIL, this.email));
        if ( ! user ) {
          self.notify('User not found', '', self.LogLevel.ERROR, true);
          return;
        }

        try {
          var res = await this.emailToken.generateToken(null, user);
          if ( ! res ) throw new Error('Error generating reset token');
          this.ctrl.add(this.NotificationMessage.create({
            message: 'Verification Email Sent',
            description: 'Verification email sent to ' + self.email,
            type: this.LogLevel.INFO,
            transient: true
          }));
        } catch(err) {
          this.ctrl.add(this.NotificationMessage.create({
            message: err.message,
            type: this.LogLevel.ERROR,
            transient: true
          }));
        }
      }
    }
  ]
});
