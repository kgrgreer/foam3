foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SignUpView',
  extends: 'foam.u2.View',

  documentation: 'User Sign up View for Ablii. For first time users.',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'auth',
    'ctrl',
    'groupDAO',
    'menuDAO',
    'smeBusinessRegistrationDAO',
    'stack',
    'user',
    'validateEmail',
    'validatePassword'
  ],

  exports: [
    'as data'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.model.Business',
    'net.nanopay.sme.ui.SplitBorder',
    'net.nanopay.ui.NewPasswordView',
  ],

  css: `
    ^ .content-form {
      margin: auto;
      width: 375px;
      margin-top: 8vh;
    }
    ^ .foam-u2-TextField,
    ^ .foam-u2-DateView,
    ^ .foam-u2-tag-Select {
      height: 40px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px 12px;
      box-sizing: border-box;
      outline: none;

      // -webkit-appearance: none;
      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }
    ^ .foam-u2-tag-Select {
      width: 100%;
    }
    ^ .full-width-input-password {
      border-radius: 4px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      padding: 12px 12px;
      box-sizing: border-box;
    }
    ^ .sme-inputContainer{
      margin-bottom: 2%
    }
    ^ .login-logo-img {
      width: 80px;
      margin-bottom: 16px;
    }
    ^ .net-nanopay-ui-NewPasswordView > div {
      position: relative;
    }
    ^ .foam-u2-TextField {
      background: white;
    }
    ^ .input-field {
      background: white;
    }
    ^terms-link {
      font-size: 14px !important;
      margin-left: 5px;
      text-decoration: none;
    }
    ^button {
      margin-top: 56px;
      cursor: pointer;
      font-size: 16px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.5;
      letter-spacing: normal;
      color: #8e9090;
      display: inline;
      position: relative;
      top: 20px;
      left: 20px;
    }

    ^ .input-image {
      position: absolute;
      width: 22px;
      height: 22px;
      bottom: 9px;
      right: 12px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'firstNameField'
    },
    {
      class: 'String',
      name: 'lastNameField'
    },
    {
      class: 'String',
      name: 'companyNameField'
    },
    {
      class: 'String',
      name: 'emailField'
    },
    {
      class: 'Password',
      name: 'passwordField',
      view: {
        class: 'net.nanopay.ui.NewPasswordView',
        passwordIcon: true
      }
    },
    {
      class: 'String',
      name: 'signUpToken'
    },
    {
      class: 'Boolean',
      name: 'disableEmail',
      documentation: `Set this to true to disable the email input field.`
    },
    'termsAndConditions'
  ],

  messages: [
    { name: 'TITLE', message: 'Create a free account' },
    { name: 'SUBTITLE', message: 'Already have an account?' },
    { name: 'F_NAME', message: 'First Name' },
    { name: 'L_NAME', message: 'Last Name' },
    { name: 'C_NAME', message: 'Company Name' },
    { name: 'EMAIL', message: 'Email Address' },
    { name: 'PASSWORD', message: 'Password' },
    { name: 'TERMS_AGREEMENT_BEFORE_LINK', message: 'I agree to Ablii’s' },
    { name: 'TERMS_AGREEMENT_LINK', message: 'Terms and Conditions' },
    { name: 'GO_BACK', message: 'Go back' },
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;
      var emailDisplayMode = this.disableEmail ?
          foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      var split = net.nanopay.sme.ui.SplitBorder.create();
      var searchParams = new URLSearchParams(location.search);
      this.signUpToken = searchParams.get('token');
      
      var left = this.Element.create().addClass('cover-img-block')
        .start('img')
          .addClass('sme-image')
          .attr('src', 'images/ablii/illustration@2x.png')
        .end();

      var right = this.Element.create()
        .addClass('content-form')
          .start().addClass('sme-registration-container')
            .start('img').addClass('login-logo-img').attr('src', 'images/ablii-wordmark.svg').end()
            .start().add(this.TITLE).addClass('sme-title').end()

            .start().addClass('input-wrapper')
              .start().addClass('input-double-left')
                .start().add(this.F_NAME).addClass('input-label').end()
                .start(this.FIRST_NAME_FIELD)
                  .addClass('input-field').attr('placeholder', 'John')
                .end()
              .end()
              .start().addClass('input-double-right')
                .start().add(this.L_NAME).addClass('input-label').end()
                .start(this.LAST_NAME_FIELD)
                  .addClass('input-field').attr('placeholder', 'Doe')
                .end()
              .end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.C_NAME).addClass('input-label').end()
              .start(this.COMPANY_NAME_FIELD)
                .addClass('input-field').attr('placeholder', 'ABC Company')
              .end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.EMAIL).addClass('input-label').end()
              .start(this.EMAIL_FIELD, { mode: emailDisplayMode })
                .addClass('input-field')
                .attr('placeholder', 'This will be your login ID')
              .end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.PASSWORD).addClass('input-label').end()
              .start(this.PASSWORD_FIELD).end()
            .end()

            .start().addClass('input-wrapper')
              .tag({ class: 'foam.u2.CheckBox' })
              .on('click', (event) => {
                this.termsAndConditions = event.target.checked;
              })
              .start().addClass('inline')
                .add(this.TERMS_AGREEMENT_BEFORE_LINK)
              .end()
              .start('a').addClass('sme').addClass('link')
                .addClass(this.myClass('terms-link'))
                .add(this.TERMS_AGREEMENT_LINK)
                .attrs({ 'href': 'https://www.ablii.com' })
              .end()
            .end()

            .start(this.CREATE_NEW).addClass('sme-button').addClass('block').addClass('login').end()
            .start().addClass('sme-subTitle')
              .start('strong').add(this.SUBTITLE).end()
              .start('span').addClass('app-link')
                .add('Sign in')
                .on('click', function() {
                  self.stack.push({ class: 'net.nanopay.sme.ui.SignInView' });
                })
              .end()
            .end()

          .end();

      split.leftPanel.add(left);
      split.rightPanel.add(right).style({ 'overflow-y': 'scroll' });

      this.addClass(this.myClass()).addClass('full-screen')
        .start().addClass('top-bar')
          .start().addClass(this.myClass('button'))
            .start()
              .addClass('horizontal-flip')
              .addClass('inline-block')
              .add('➔')
            .end()
            .add(this.GO_BACK)
          .end()
          .on('click', () => {
            window.location = 'https://www.ablii.com';
          })
        .end()
      .add(split);
    },

    function validating() {
      if ( this.isEmpty(this.firstNameField) ) {
        this.add(this.NotificationMessage.create({ message: 'First Name Field Required.', type: 'error' }));
        return false;
      }
      if ( this.firstNameField.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( /\d/.test(this.firstNameField) ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot contain numbers', type: 'error' }));
        return false;
      }
      if ( this.lastNameField.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( /\d/.test(this.lastNameField) ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot contain numbers.', type: 'error' }));
        return false;
      }
      if ( this.isEmpty(this.lastNameField) ) {
        this.add(this.NotificationMessage.create({ message: 'Last Name Field Required.', type: 'error' }));
        return false;
      }
      if ( this.companyNameField > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Company Name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( this.isEmpty(this.companyNameField) ) {
        this.add(this.NotificationMessage.create({ message: 'Company Name Field Required.', type: 'error' }));
        return false;
      }
      if ( this.isEmpty(this.emailField) ) {
        this.add(this.NotificationMessage.create({ message: 'Email Field Required.', type: 'error' }));
        return false;
      }
      if ( ! this.validateEmail(this.emailField) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid email address.', type: 'error' }));
        return false;
      }
      if ( this.isEmpty(this.passwordField) ) {
        this.add(this.NotificationMessage.create({ message: 'Password Field Required.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePassword(this.passwordField) ) {
        this.add(this.NotificationMessage.create({ message: 'Password must be at least 6 characters long.', type: 'error' }));
        return false;
      }
      if ( ! this.termsAndConditions ) {
        this.add(this.NotificationMessage.create({ message: 'Please accept the Terms and Conditions', type: 'error' }));
        return false;
      }
      return true;
    },

    function isEmpty(field) {
      return field.trim() === '';
    },

    function logIn() {
      this.auth
        .loginByEmail(null, this.emailField, this.passwordField)
        .then((user) => {
          if ( user && user.twoFactorEnabled ) {
            this.user.copyFrom(user);
            this.stack.push({
              class: 'foam.nanos.auth.twofactor.TwoFactorSignInView'
            });
          } else {
            this.user.copyFrom(user);
            ctrl.add(this.NotificationMessage.create({
              message: 'Login successful.'
            }));
            if ( ! this.user.emailVerified ) {
              this.stack.push({
                class: 'foam.nanos.auth.ResendVerificationEmail'
              });
            } else {
              // Go to group's default screen.
              this.groupDAO
                .find(this.user.group)
                .then((group) => {
                  this.menuDAO
                    .find(group.defaultMenu)
                    .then((menu) => {
                      menu.launch();
                    })
                    .catch((err) => {
                      this.ctrl.add(this.NotificationMessage.create({
                        message: err.message || `Couldn't find menu "${group.defaultMenu}"`,
                        type: 'error'
                      }));
                    });
                })
                .catch((err) => {
                  this.ctrl.add(this.NotificationMessage.create({
                    message: err.message || `Couldn't find group "${this.user.group}"`,
                    type: 'error'
                  }));
                });
            }
          }
        })
        .catch((err) => {
          this.ctrl.add(this.NotificationMessage.create({
            message: err.message || 'There was a problem while signing you in.',
            type: 'error'
          }));
        });
    }
  ],

  actions: [
    {
      name: 'createNew',
      label: 'Create account',
      code: function(X, obj) {
        if ( ! this.validating() ) return;
        var newUser = this.User.create({
          firstName: this.firstNameField,
          lastName: this.lastNameField,
          email: this.emailField,
          desiredPassword: this.passwordField,
          organization: this.companyNameField,
          signUpToken: this.signUpToken,
          // Don't send the "welcome to nanopay" email, send the email
          // verification email instead.
          welcomeEmailSent: true,
          group: 'sme',
          signUpToken: this.signUpToken
        });

        this.smeBusinessRegistrationDAO
          .put(newUser)
          .then((user) => {
            this.user = user;
            ctrl.add(this.NotificationMessage.create({
              message: 'User and business created.'
            }));
            this.logIn();
          })
          .catch((err) => {
            ctrl.add(this.NotificationMessage.create({
              message: err.message || 'There was a problem creating your account.',
              type: 'error'
            }));
          });
      }
    }
  ]
});
