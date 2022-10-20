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
      visibility: function() {
        return this.emailDisabled ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW
      }
    },
    {
      class: 'String',
      name: 'userName',
      section: 'emailSection',
      visibility: function(userNameRequired) {
        return userNameRequired ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validateObj: function(userNameRequired, userName) {
        return userNameRequired && ! userName ? 'Username is required.' : '';
      }
    },
    {
      class: 'Boolean',
      section: 'emailSection',
      name: 'userNameRequired',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'emailDisabled',
      value: false,
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
        var dao = this.userDAO.where(this.EQ(this.User.EMAIL, this.email));
        var users = (await dao.select()).array;
        var user;
        if ( users.length < 1 ) {
          this.ctrl.add(this.NotificationMessage.create({
            message: 'User not found',
            description: 'User not found under email ' + self.email,
            type: this.LogLevel.ERROR,
            transient: true
          }));
          throw new Error('User not found.');
        } else if ( users.length == 1 ) {
          user = users[0];
        } else {
          if ( this.userName ) {
            var res = await dao.find(this.EQ(this.User.USER_NAME, this.userName));
            if ( res ) user = res;
            else {
              this.ctrl.add(this.NotificationMessage.create({
                message: 'User not found',
                description: 'User not found under username ' + self.userName,
                type: this.LogLevel.ERROR,
                transient: true
              }));
              throw new Error('User not found.');
            }
          } else {
            this.userNameRequired = true
            throw new Error('Username is required.');
          }
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
