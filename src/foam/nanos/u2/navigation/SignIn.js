/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.u2.navigation',
  name: 'SignIn',

  documentation: `User Signin model to be used with LoginView.
  `,

  imports: [
    'auth',
    'ctrl',
    'currentMenu',
    'loginSuccess',
    'loginView?',
    'memento_',
    'menuDAO',
    'pushMenu',
    'stack',
    'subject',
    'translationService',
    'window'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.stack.StackBlock',
    'foam.nanos.auth.DuplicateEmailException'
  ],

  messages: [
    { name: 'TITLE', message: 'Welcome!' },
    { name: 'FOOTER_TXT', message: 'Not a user yet?' },
    { name: 'ERROR_MSG', message: 'There was an issue logging in' },
    { name: 'ERROR_MSG2', message: 'Please enter email or username' },
    { name: 'ERROR_MSG3', message: 'Please enter password' }
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
      class: 'String',
      name: 'username',
      visibility: function(usernameRequired) {
        return usernameRequired ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      postSet: function(_, n) {
        this.identifier = n;
        return n;
      }
    },
    {
      flags: ['web'],
      name: 'email',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'usernameRequired',
      hidden: true
    },
    {
      class: 'String',
      name: 'identifier',
      required: true,
      label: 'Email or Username',
      preSet: function(_, n) {
        return n.trim();
      },
      view: {
        class: 'foam.u2.TextField',
        focused: true
      },
      visibility: function(disableIdentifier_, usernameRequired) {
        return usernameRequired ? foam.u2.DisplayMode.HIDDEN :
          disableIdentifier_ ? foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      },
      validationTextVisible: false
    },
    {
      class: 'Password',
      name: 'password',
      required: true,
      view: { class: 'foam.u2.view.PasswordView', passwordIcon: true },
      validationTextVisible: false
    },
    {
      class: 'Boolean',
      name: 'disableIdentifier_',
      hidden: true
    },
    {
      class: 'String',
      name: 'token_',
      hidden: true
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
    },
    {
      class: 'Boolean',
      name: 'loginFailed',
      value: true,
      hidden: true,
      documentation: 'Used to control flow in transient wizard signin'
    }
  ],

  methods: [
    {
      name: 'nextStep',
      code: async function() {
        if ( this.subject.realUser.twoFactorEnabled ) {
          this.loginSuccess = false;
          this.window.history.replaceState({}, document.title, '/');
          this.stack.push(this.StackBlock.create({
            view: { class: 'foam.nanos.auth.twofactor.TwoFactorSignInView' }
          }));
        } else {
          if ( ! this.subject.realUser.emailVerified ) {
            await this.auth.logout();
            this.stack.push(this.StackBlock.create({
              view: { class: 'foam.nanos.auth.ResendVerificationEmail' }
            }));
          } else {
            this.loginSuccess = !! this.subject;
            // reload the client on loginsuccess in case login not called from controller
            if ( this.loginSuccess ) await this.ctrl.reloadClient();
          }
        }
      }
    },
    {
      name: 'notifyUser',
      code: function(err, msg, type) {
        this.ctrl.add(this.NotificationMessage.create({
          err: err,
          message: msg,
          type: type
        }));
      }
    }
  ],

  actions: [
    {
      name: 'login',
      label: 'Sign in',
      buttonStyle: 'PRIMARY',
      // if you use isAvailable or isEnabled - with model error_, then note that auto validate will not
      // work correctly. Chorme for example will not read a field auto populated without a user action
      isAvailable: function(showAction) { return showAction; },
      code: async function(x) {
        if ( this.identifier.length > 0 ) {
          if ( ! this.password ) {
            this.notifyUser(undefined, this.ERROR_MSG3, this.LogLevel.ERROR);
            return;
          }
          try {
            let logedInUser = await this.auth.login(x, this.identifier, this.password);
            this.loginFailed = false;
            if ( ! logedInUser ) return;
            this.email = logedInUser.email;
            this.username = logedInUser.userName;
            this.identifier = this.email;
            if ( this.token_ ) {
              logedInUser.signUpToken = this.token_;
              try {
                let updatedUser = await this.dao_.put(logedInUser);
                this.subject.user = updatedUser;
                this.subject.realUser = updatedUser;
                if ( ! this.pureLoginFunction ) await this.nextStep();
              } catch ( err ) {
                this.notifyUser(err.data, this.ERROR_MSG, this.LogLevel.ERROR);
              }
            } else {
              this.subject.user = logedInUser;
              this.subject.realUser = logedInUser;
              if ( ! this.pureLoginFunction ) await this.nextStep();
            }
          } catch (err) {
              this.loginFailed = true;
              let e = err && err.data ? err.data.exception : err;
              if ( this.DuplicateEmailException.isInstance(e) ) {
                if ( this.username ) {
                  try {
                    logedInUser = await this.auth.login(x, this.username, this.password);
                    this.loginFailed = false;
                    this.subject.user = logedInUser;
                    this.subject.realUser = logedInUser;
                    if ( ! this.pureLoginFunction ) await this.nextStep();
                    return;
                  } catch ( err ) {
                    username = '';
                  }
                }
                this.usernameRequired = true;
                this.email = this.identifier;
              }
              this.notifyUser(err.data, this.ERROR_MSG, this.LogLevel.ERROR);
          }
        } else {
          this.notifyUser(undefined, this.ERROR_MSG2, this.LogLevel.ERROR);
        }
      }
    },
    {
      name: 'footer',
      label: 'Create an account',
      section: 'footerSection',
      buttonStyle: 'LINK',
      isAvailable: function(showAction) { return showAction; },
      code: function(X) {
        X.window.history.replaceState(null, null, X.window.location.origin);
        X.stack.push(X.data.StackBlock.create({ view: { ...(X.loginView ?? { class: 'foam.u2.view.LoginView' }), mode_: 'SignUp', topBarShow_: X.topBarShow_, param: X.param }, parent: X }));
      }
    },
    {
      name: 'subFooter',
      label: 'Forgot password?',
      section: 'footerSection',
      buttonStyle: 'LINK',
      isAvailable: function(showAction) { return showAction; },
      code: function(X) {
        X.stack.push(X.data.StackBlock.create({
          view: {
            class: 'foam.nanos.auth.ChangePasswordView',
            modelOf: 'foam.nanos.auth.RetrievePassword'
          }
        }));
      }
    }
  ]
});
