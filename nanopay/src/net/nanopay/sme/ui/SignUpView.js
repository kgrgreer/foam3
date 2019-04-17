foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SignUpView',
  extends: 'foam.u2.Controller',

  documentation: 'User Sign up View for Ablii. For first time users.',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [
    'acceptanceDocumentService',
    'auth',
    'groupDAO',
    'loginSuccess',
    'menuDAO',
    'notify',
    'smeBusinessRegistrationDAO',
    'stack',
    'user',
    'validateEmail'
  ],

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.model.Business',
    'net.nanopay.sme.ui.SplitBorder',
    'net.nanopay.ui.NewPasswordView',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentService'
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
      padding: 12px 34px 12px 12px ! important;
    }
    ^ .sme-inputContainer{
      margin-bottom: 2%
    }
    ^ .login-logo-img {
      height: 19.4;
      margin-bottom: 12px;
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

    /* This is required for the visibility icon of the password field */
    ^ .input-image {
      position: absolute !important;
      width: 16px !important;
      height: 16px !important;
      bottom: 12px !important;
      right: 12px !important;
    }
    ^ .link {
      margin-right: 5px;
    }
  `,

  properties: [
    {
      name: 'passwordStrength',
      value: 0
    },
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
    {
      class: 'Boolean',
      name: 'disableCompanyName',
      documentation: `Set this to true to disable the Company Name input field.`
    },
    'termsAndConditions',   
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'termsAgreementDocument'
    },
  ],

  messages: [
    { name: 'TITLE', message: 'Create a free account' },
    { name: 'SUBTITLE', message: 'Already have an account?' },
    { name: 'F_NAME', message: 'First Name' },
    { name: 'L_NAME', message: 'Last Name' },
    { name: 'C_NAME', message: 'Company Name' },
    { name: 'EMAIL', message: 'Email Address' },
    { name: 'PASSWORD', message: 'Password' },
    { name: 'TERMS_AGREEMENT_LABEL', message: 'I agree to Ablii’s' },
    { name: 'TERMS_AGREEMENT_LABEL_2', message: 'Terms and Conditions' },
    { name: 'TERMS_AGREEMENT_DOCUMENT_NAME', message: 'NanopayTermsAndConditions' },
    { name: 'GO_BACK', message: 'Go to ablii.com' },
    { name: 'PASSWORD_STRENGTH_ERROR', message: 'Password is not strong enough.' },
    { name: 'TOP_MESSAGE', message: `Ablii is currently in early access, for now only approved emails can create an account.  Contact us at hello@ablii.com if you'd like to join!` }
  ],

  methods: [
     function init() {
       this.SUPER();
       this.loadAcceptanceDocument();
     },

    function initE() {
      this.SUPER();

      var self = this;
      var emailDisplayMode = this.disableEmail ?
          foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      var companyNameDisplayMode = this.disableCompanyName ?
          foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      var split = net.nanopay.sme.ui.SplitBorder.create();
      var searchParams = new URLSearchParams(location.search);
      this.signUpToken = searchParams.get('token');

      var left = this.Element.create().addClass('cover-img-block')
        .start('img')
          .addClass('sme-image')
          .attr('src', 'images/sign_in_illustration.png')
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
                  .addClass('input-field').attr('placeholder', 'Smith')
                .end()
              .end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.C_NAME).addClass('input-label').end()
              .start(this.COMPANY_NAME_FIELD, { mode: companyNameDisplayMode })
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
              .start(this.PASSWORD_FIELD, {
                passwordStrength$: this.passwordStrength$
              }).end()
            .end()

            .start().addClass('input-wrapper')
              .start({ class: 'foam.u2.CheckBox' })
                .on('click', (event) => {
                  this.termsAndConditions = event.target.checked;
                })
              .end()
              .start().addClass('inline')
                .add(this.TERMS_AGREEMENT_LABEL)
              .end()
              .start('a').addClass('sme').addClass('link')
                .addClass(this.myClass('terms-link'))
                .add(this.TERMS_AGREEMENT_LABEL_2)
                .on('click', () => {
                  window.open(this.termsAgreementDocument.link);
                })
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
      split.rightPanel.add(right);

      this.addClass(this.myClass()).addClass('full-screen')
        .start().addClass('top-bar')
          .start().addClass('top-bar-message')
              .add(this.TOP_MESSAGE)
          .end()
          .start().addClass('top-bar-inner')
            .start().addClass(this.myClass('button'))
              .start()
                .addClass('horizontal-flip')
                .addClass('inline-block')
                .add('➔')
              .end()
              .add(this.GO_BACK)
              .on('click', () => {
                window.location = 'https://www.ablii.com';
              })
            .end()
          .end()
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
            this.loginSuccess = false;
            this.user.copyFrom(user);
            this.stack.push({
              class: 'foam.nanos.auth.twofactor.TwoFactorSignInView'
            });
          } else {
            this.loginSuccess = user ? true : false;
            this.user.copyFrom(user);
            if ( ! this.user.emailVerified ) {
              this.stack.push({
                class: 'foam.nanos.auth.ResendVerificationEmail'
              });
            } else {
              // This is required for signin
              window.location.hash = '';
            }
          }
        })
        .catch((err) => {
          this.notify(err.message || 'There was a problem while signing you in.', 'error');
        });
    }, 

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
          group: 'sme'
        });      

        this.smeBusinessRegistrationDAO
          .put(newUser)
          .then((user) => {
            this.user = user;
            // update user accepted terms and condition
            try {
              this.acceptanceDocumentService.
              updateUserAcceptanceDocument(this.__context__, user.id, this.termsAgreementDocument.id, this.termsAndConditions); 
            } catch (err) {
              console.warn('Error updateing acceptance document: ', err);
              this.notify(err.message || 'There was a problem updating terms and condition status.', 'error');
              return;
            }
           
            this.logIn();             
          })
          .catch((err) => {
            this.notify(err.message || 'There was a problem creating your account.', 'error');
          });          
      }
    }
  ],

  listeners: [
    async function loadAcceptanceDocument() {
      try {
        this.termsAgreementDocument = await this.acceptanceDocumentService.getAcceptanceDocument(this.__context__, this.TERMS_AGREEMENT_DOCUMENT_NAME, '');
      } catch (error) {
        console.warn('Error occured finding Terms Agreement: ', error);
      }
    }
  ]
});

