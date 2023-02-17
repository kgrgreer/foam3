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
    'emailVerificationService',
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

  messages: [
    { name: 'CODE_INSTRUC_TITLE',       message: 'Verification code sent' },
    { name: 'CODE_INSTRUC',             message: 'Please check your inbox to verify your email' },
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
      visibility: function(emailDisabled) {
        return emailDisabled ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW
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

  methods: [
    async function checkUser() {
      // check user exists and if more than one user exists under the same email,
      // prompt for username
      var dao = this.userDAO.where(this.EQ(this.User.EMAIL, this.email));
      var users = (await dao.select()).array;
      var user;
      if ( users.length < 1 ) {
        this.ctrl.add(this.NotificationMessage.create({
          message: 'User not found',
          description: 'User not found under email ' + this.email,
          type: this.LogLevel.ERROR,
          transient: true
        }));
        throw new Error('User not found.');
      } else if ( users.length == 1 ) {
        user = users[0];
        this.userName = user.userName;
      } else {
        if ( this.userName ) {
          var res = await dao.find(this.EQ(this.User.USER_NAME, this.userName));
          if ( res ) user = res;
          else {
            this.ctrl.add(this.NotificationMessage.create({
              message: 'User not found',
              description: 'User not found under username ' + this.userName,
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
      return user;
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
        try {
          await this.emailVerificationService.verifyByCode(null, this.email, this.userName, '');
          instructionTitle = this.CODE_INSTRUC_TITLE;
          instruction = this.CODE_INSTRUC;

          this.ctrl.add(this.NotificationMessage.create({
            message: instructionTitle,
            description: instruction,
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
