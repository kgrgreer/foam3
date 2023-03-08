/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SignUp',

  documentation: `Model used for registering/creating an user.
  Hidden properties create the different functionalities for this view (Ex. coming in with a signUp token)`,

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'appConfig',
    'auth',
    'ctrl',
    'emailVerificationService',
    'loginSuccess',
    'loginView?',
    'pushMenu',
    'stack',
    'subject',
    'theme',
    'translationService',
    'window'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.stack.StackBlock'
  ],

  messages: [
    { name: 'TITLE', message: 'Create an account' },
    { name: 'FOOTER_TXT', message: 'Already have an account?' },
    { name: 'ERROR_MSG', message: 'There was a problem creating your account' },
    { name: 'EMAIL_ERR', message: 'Valid email required' },
    { name: 'EMAIL_AVAILABILITY_ERR', message: 'This email is already in use. Please sign in or use a different email' },
    { name: 'USERNAME_EMPTY_ERR', message: 'Username required' },
    { name: 'USERNAME_AVAILABILITY_ERR', message: 'This username is taken. Please try another.' },
    //TODO: Find out better way to deal with PASSWORD_ERR
    { name: 'PASSWORD_ERR', message: 'Password should be at least 10 characters' },
    { name: 'WEAK_PASSWORD_ERR', message: 'Password is weak' },
    { name: 'SUCCESS_MSG', message: 'Account successfully created' },
    { name: 'SUCCESS_MSG_TITLE', message: 'Success' },
    { name: 'ERROR_MSG_LOGIN', message: 'There was a problem signing into your account' }
  ],
  
  sections: [
    {
      name: '_defaultSection',
      title: ''
    },
    {
      name: 'footerSection',
      title: '',
      isAvailable: () => false
    }
  ],


  properties: [
    {
      name: 'dao_',
      hidden: true,
      transient: true
    },
    {
      class: 'Boolean',
      name: 'isLoading_',
      documentation: `Condition to synchronize code execution and user response.`,
      hidden: true
    },
    {
      class: 'String',
      name: 'token_',
      documentation: `Input to associate new user with something.`,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'disableEmail_',
      documentation: `Set this to true to disable the email input field.`,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'emailAvailable',
      documentation: `Binded property used to display email not available error.`,
      value: true,
      hidden: true
    },
    {
      class: 'EMail',
      name: 'email',
      placeholder: 'example@example.com',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.UserPropertyAvailabilityView',
          icon: 'images/checkmark-small-green.svg',
          onKey: true,
          isAvailable$: X.data.emailAvailable$,
          inputValidation: /\S+@\S+\.\S+/,
          restrictedCharacters: /^[^\s]$/,
          displayMode: X.data.disableEmail_ ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW
        };
      },
      validateObj: function(email, emailAvailable) {
        // Empty Check
        if ( email.length === 0 || ! /\S+@\S+\.\S+/.test(email) ) return this.EMAIL_ERR;
        // Availability Check
        if ( ! emailAvailable ) return this.EMAIL_AVAILABILITY_ERR;
      }
    },
    {
      class: 'Boolean',
      name: 'usernameAvailable',
      documentation: `Binded property used to display username not available error.`,
      value: true,
      hidden: true
    },
    {
      class: 'String',
      name: 'userName',
      label: 'Username',
      placeholder: 'example123',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.UserPropertyAvailabilityView',
          icon: 'images/checkmark-small-green.svg',
          onKey: true,
          isAvailable$: X.data.usernameAvailable$,
          inputValidation: /^[^\s\/]+$/,
          restrictedCharacters: /^[^\s\/]$/
        };
      },
      validateObj: function(userName, usernameAvailable) {
        // Empty Check
        if ( userName.length === 0 ) return this.USERNAME_EMPTY_ERR;
        // Availability Check
        if ( ! usernameAvailable ) return this.USERNAME_AVAILABILITY_ERR;
      }
    },
    {
      class: 'Boolean',
      name: 'passwordAvailable',
      value: true,
      hidden: true
    },
    {
      class: 'Password',
      name: 'desiredPassword',
      label: 'Password',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.PasswordView',
          isAvailable$: X.data.passwordAvailable$,
          passwordIcon: true
        }
      },
      validateObj: function(desiredPassword, passwordAvailable) {
        if ( ! desiredPassword || desiredPassword.length < 10 ) return this.PASSWORD_ERR;
        if ( ! passwordAvailable ) return this.WEAK_PASSWORD_ERR;
      }
    },
    {
      class: 'Boolean',
      name: 'showAction',
      visibility: 'HIDDEN',
      value: true,
      documentation: 'Optional boolean used to display this model without login action'
    },
    {
      class: 'Boolean',
      name: 'pureLoginFunction',
      documentation: 'Set to true, if we just want to login without application redirecting.',
      hidden: true
    }
  ],

  listeners: [
    {
      name: 'emailVerifiedListener',
      code: async function() {
        try {
          await this.auth.login(x, this.userName, this.desiredPassword);
          this.subject = this.ctrl.__subContext__.auth.getCurrentSubject(null);
          this.loginSuccess = true;
          await this.ctrl.reloadClient();
        } catch(err) {
          this.ctrl.add(this.NotificationMessage.create({
            err: err.data,
            message: this.ERROR_MSG_LOGIN,
            type: this.LogLevel.ERROR
          }));
          this.pushMenu('sign-in', true);
        }
      }
    }
  ],

  methods: [
    {
      name: 'nextStep',
      code: async function() {
        await this.finalRedirectionCall();
      }
    },
    {
      name: 'finalRedirectionCall',
      code: async function() {
        if ( this.subject.user.emailVerified ) {
          // When a link was sent to user to SignUp, they will have already verified thier email,
          // thus thier user.emailVerified should be true and they can simply login from here.
          this.window.history.replaceState(null, null, this.window.location.origin);
          location.reload();
        } else {
          // login function in signup sets the subject to the signed up user without logging in
          // here we save the new user info to be used later in emailverification
          // and reset the subject to the anonymous subject before verification step
          var user = this.subject.user;
          this.subject = await this.auth.getCurrentSubject(null);
          this.emailVerificationService.sub('emailVerified', this.emailVerifiedListener)
          this.stack.push(this.StackBlock.create({
            view: {
              class: 'foam.u2.borders.StatusPageBorder', showBack: false,
              children: [{
                class: 'foam.nanos.auth.email.VerificationCodeView',
                data: {
                  class: 'foam.nanos.auth.email.EmailVerificationCode',
                  email: user.email,
                  userName: user.userName,
                  showAction: true,
                  signinOnSubmit: true
                }
              }]
            }
          }));
        }
      }
    },
    {
      name: 'defaultUserLanguage',
      code: function() {
        let l = foam.locale.split('-');
        let code = l[0];
        let variant = l[1];
        let language = foam.nanos.auth.Language.create({ code: code });
        if ( variant ) language.variant = variant;
        return language;
      }
    }
  ],
  actions: [
    {
      name: 'login',
      label: 'Get started',
      buttonStyle: 'PRIMARY',
      isEnabled: function(errors_, isLoading_) {
        return ! errors_ && ! isLoading_;
      },
      isAvailable: function(showAction) { return showAction; },
      code: function(x) {
        this.isLoading_ = true;
        let createdUser = this.User.create({
          userName: this.userName,
          email: this.email,
          desiredPassword: this.desiredPassword,
          signUpToken: this.token_,
          language: this.defaultUserLanguage()
        });
        this.dao_
          .put(createdUser)
          .then(async user => {
            this.subject.realUser = user;
            this.subject.user = user;

            if ( ! this.pureLoginFunction ) await this.nextStep(x);

            this.ctrl.add(this.NotificationMessage.create({
              message: this.SUCCESS_MSG_TITLE,
              description: this.SUCCESS_MSG,
              type: this.LogLevel.INFO,
              transient: true
            }));
          }).catch(err => {
            this.ctrl.add(this.NotificationMessage.create({
              err: err.data,
              message: this.ERROR_MSG,
              type: this.LogLevel.ERROR
            }));
          })
          .finally(() => {
            this.isLoading_ = false;
          });
      }
    },
    {
      name: 'footer',
      section: 'footerSection',
      label: 'Sign in',
      buttonStyle: 'LINK',
      code: function(X) {
        X.window.history.replaceState(null, null, X.window.location.origin);
        X.stack.push(X.data.StackBlock.create({ view: { ...(X.loginView ?? { class: 'foam.u2.view.LoginView' }), mode_: 'SignIn', topBarShow_: X.topBarShow_, param: X.param }, parent: X }));
      }
    },
    {
      name: 'subFooter',
      section: 'footerSection',
      isAvailable: () => false,
      code: () => {}
    }
  ]
});
