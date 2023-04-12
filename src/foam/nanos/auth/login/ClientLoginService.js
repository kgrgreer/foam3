/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.auth.login',
  name: 'ClientLoginService',

  imports: [
    'auth',
    'ctrl',
    'defaultUserLanguage',
    'emailVerificationService',
    'loginSuccess',
    'notifyUser',
    'stack',
    'subject',
    'wizardController',
    'wizardletId',
    'wizardlets'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.DuplicateEmailException',
    'foam.nanos.auth.login.SignIn',
    'foam.nanos.auth.UnverifiedEmailException',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.stack.StackBlock'
  ],

  messages: [
    { name: 'SIGNIN_ERR', message: 'There was an issue logging in' },
    { name: 'SIGNUP_ERR',  message: '' },
    { name: 'SIGNUP_SUCCESS_TITLE', message: '' },
    { name: 'SIGNUP_SUCCESS_MSG', message: '' }
  ],

  methods: [
    {
      name: 'signin',
      code: async function(x, data, wizardFlow) {
        try {
          var loginId = data.usernameRequired_ ? data.username : data.identifier;
          let logedInUser = await this.auth.login(x, loginId, data.password);
          
          if ( ! logedInUser ) return;
          data.email = logedInUser.email;
          data.username = logedInUser.userName;

          this.subject.user = logedInUser;
          this.subject.realUser = logedInUser;

          this.loginSuccess = true;
          await this.ctrl.reloadClient();
          this.ctrl.subject = this.subject;

          if ( ! wizardFlow ) {
            await ctrl.checkGeneralCapability();
            await ctrl.onUserAgentAndGroupLoaded();
          }
        } catch (err) {
          let e = err && err.data ? err.data.exception : err;
          if ( this.DuplicateEmailException.isInstance(e) ) {
            data.email = data.identifier;
            if ( this.username ) {
              try {
                logedInUser = await this.auth.login(x, data.username, data.password);
                this.subject.user = logedInUser;
                this.subject.realUser = logedInUser;
                return;
              } catch ( err ) {
                data.username = '';
              }
            }
            data.usernameRequired = true;
          }
          if ( this.UnverifiedEmailException.isInstance(e) ) {
            var email = this.usernameRequired ? data.email : data.identifier;
            if ( wizardFlow ) {
              this.wizardVerifyEmail(x, email, data.username, data.password);
              var latch = foam.core.Latch.create();
              this.onDetach(this.emailVerificationService.sub('emailVerified', () => latch.resolve()));
              await latch;
              // retry signin
              await this.signin(x, data, true);
            }
            else await this.verifyEmail(x, email, data.username, data.password);
            return;
          }
          this.notifyUser(err.data, this.SIGNIN_ERR, this.LogLevel.ERROR);
        }
      }
    },
    {
      name: 'signup',
      code: async function(x, data, wizardFlow) {
        let createdUser = this.User.create({
          userName: data.username,
          email: data.email,
          desiredPassword: data.desiredPassword,
          language: this.defaultUserLanguage
        });
        var user = await data.dao_.put(createdUser);
        if ( user ) {
          this.notifyUser_(this.SIGNUP_SUCCESS_TITLE, this.SIGNUP_SUCCESS_MSG, this.LogLevel.INFO);

          var signinModel = this.SignIn.create({ identifier: data.email, username: data.username, email: data.email, password: data.desiredPassword });
          await this.signin(x, signinModel, wizardFlow)
        } else {
          this.notifyUser_(err.data, this.SIGNUP_ERR, this.LogLevel.ERROR);
        }
      }
    },
    {
      name: 'verifyEmail',
      code: async function(x, email, username, password) {
        var signinModel = this.SignIn.create({ identifier: email, email: email, username: username, password: password });
        this.onDetach(this.emailVerificationService.sub('emailVerified', async () => {
          await this.emailVerifiedListener(x, signinModel) 
        }));
        this.stack.push(this.StackBlock.create({
          view: {
            class: 'foam.u2.borders.StatusPageBorder',
            showBack: false,
            children: [{
              class: 'foam.nanos.auth.email.VerificationCodeView',
              data: {
                class: 'foam.nanos.auth.email.EmailVerificationCode',
                email: email,
                userName: username,
                showAction: true
              }
            }]
          }
        }, this));
      }
    },
    {
      name: 'wizardVerifyEmail',
      code: async function(x, email, username, password) {
        var ctx = this.__subContext__.createSubContext({ email: email, username: username })
        const wizardRunner = foam.u2.crunch.WizardRunner.create({
          wizardType: foam.u2.wizard.WizardType.UCJ,
          source: 'net.nanopay.auth.VerifyEmailByCode'
        }, ctx);

        await wizardRunner.launch(undefined, { inline: false });
      }
    },
    {
      name: 'generalAdmissionsCheck',
      code: async function() {

      }
    },
    {
      name: 'resetPassword',
      code: async function() {
        this.stack.push(this.StackBlock.create({
          view: {
            class: 'foam.nanos.auth.ChangePasswordView',
            modelOf: 'foam.nanos.auth.RetrievePassword'
          }
        }));
      }
    },
    {
      name: 'notifyUser_',
      code: function(err, msg, type) {
        this.ctrl.add(this.NotificationMessage.create({
          err: err,
          message: msg,
          type: type,
          transient: true
        }));
      }
    },
    {
      name: 'wizardEmailVerified',
      code: async function(x, data) {
        try {
          await this.signin(x, data, true);
          this.subject = await this.auth.getCurrentSubject(null);
          this.loginSuccess = true;
        } catch (err) {
          this.error('^login-failed-post-verify', err);
          console.error(err);
        }
      }
    }
  ],

  listeners: [
    {
      name: 'emailVerifiedListener',
      code: async function(x, data, wizardFlow) {
        if (wizardFlow) {
          await this.wizardEmailVerified(x, data);
        } else {
          await this.signin(x, data, wizardFlow);
        }
      }
    }
  ]
});
