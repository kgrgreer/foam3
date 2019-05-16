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
    'countryDAO',
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
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'foam.u2.Element',
    'net.nanopay.documents.AcceptanceDocument',
    'net.nanopay.documents.AcceptanceDocumentService',
    'net.nanopay.model.Business',
    'net.nanopay.sme.ui.SplitBorder',
    'net.nanopay.ui.NewPasswordView'
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
    ^ .terms {
      font-size: 12px !important;
    }
    ^terms-link {
      font-size: 12px !important;
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
    ^ .foam-u2-tag-Select {
      width: 100%;
      font-size: 14px;
      height: 40px;
      border: solid 1px #8e9090;
      background: #fff;
      border-radius: 3px;
      font-weight: 400;
      padding: 12px;
      color: #8e9090;
      box-shadow: none;
    }
    ^disclaimer {
      width: 331px;
      font-family: Lato;
      font-size: 10px;
      color: #8e9090;
      margin: 50px auto 0 auto;
      line-height: 1.5;
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
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      documentation: 'Reference to affiliated country.',
      name: 'country'
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
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Create a free account' },
    { name: 'SUBTITLE', message: 'Already have an account?' },
    { name: 'F_NAME', message: 'First Name' },
    { name: 'L_NAME', message: 'Last Name' },
    { name: 'C_NAME', message: 'Company Name' },
    { name: 'COUNTRY_LABEL', message: 'Country of operation' },
    { name: 'EMAIL', message: 'Email Address' },
    { name: 'PASSWORD', message: 'Password' },
    { name: 'TERMS_AGREEMENT_LABEL', message: 'I agree to Ablii’s' },
    { name: 'TERMS_AGREEMENT_LABEL_2', message: 'Terms and Conditions' },
    { name: 'TERMS_AGREEMENT_DOCUMENT_NAME', message: 'NanopayTermsAndConditions' },
    { name: 'PRIVACY_DOCUMENT_NAME', message: 'privacyPolicy' },
    { name: 'GO_BACK', message: 'Go to ablii.com' },
    { name: 'PASSWORD_STRENGTH_ERROR', message: 'Password is not strong enough.' },
    { name: 'TOP_MESSAGE', message: `Ablii is currently in early access, for now only approved emails can create an account.  Contact us at hello@ablii.com if you'd like to join!` },
    { name: 'TERMS_CONDITIONS_ERR', message: `Please accept the Terms and Conditions and Privacy Policy.` },
    { name: 'AND', message: `and`},
    { name: 'PRIVACY_LABEL', message: `Privacy Policy` },
    { name: 'QUEBEC_DISCLAIMER', message: '*Ablii does not currently support businesses in Quebec. We are working hard to change this! If you are based in Quebec, check back for updates.' }

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
        .end()
        .start('p')
          .addClass(this.myClass('disclaimer'))
          .add(this.QUEBEC_DISCLAIMER)
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
              .start().add(this.COUNTRY_LABEL).addClass('input-label').end()
              .start(this.COUNTRY.clone().copyFrom({
                view: {
                  class: 'foam.u2.view.ChoiceView',
                  placeholder: 'Select your country',
                  dao: this.countryDAO.where(this.OR(
                    this.EQ(this.Country.NAME, 'Canada'),
                    // this.EQ(this.Country.NAME, 'USA')
                  )),
                  objToChoice: function(a) {
                    return [a.id, a.name];
                  }
                }
              }))
              .end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.EMAIL).addClass('input-label').end()
              .start(this.EMAIL_FIELD, { mode: emailDisplayMode })
                .addClass('input-field')
                .attr('placeholder', 'Example@example.com')
              .end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.PASSWORD).addClass('input-label').end()
              .start(this.PASSWORD_FIELD, {
                passwordStrength$: this.passwordStrength$
              }).end()
            .end()

            .start().addClass('input-wrapper').addClass('terms')
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
              .start().addClass('inline')
                .add(this.AND)
              .end()
              .start('a').addClass('sme').addClass('link')
                .addClass(this.myClass('terms-link'))
                .add(this.PRIVACY_LABEL)
                .on('click', () => {
                  window.open(this.privacyDocument.link);
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
      var msg;
      if ( ! (this.isEmpty(msg = this.User.FIRST_NAME.validateObj(this.firstNameField))) ) {
        this.notify(msg, 'error');
        return false;
      }
      if ( ! (this.isEmpty(msg = this.User.LAST_NAME.validateObj(this.lastNameField))) ) {
        this.notify(msg, 'error');
        return false;
      }
      if ( ! (this.isEmpty(msg = this.User.ORGANIZATION.validateObj(this.companyNameField))) ) {
        this.notify(msg, 'error');
        return false;
      }
      if ( ! (this.isEmpty(msg = this.User.EMAIL.validateObj(this.emailField))) ) {
        this.notify(msg, 'error');
        return false;
      }

      if ( this.isEmpty(this.country) ) {
        this.notify(this.COUNTRY_ERROR, 'error');
        return false;
      }

      if ( ! this.termsAndConditions ) {
        this.notify(this.TERMS_CONDITIONS_ERR, 'error');
        return false;
      }
      return true;
    },

    function isEmpty(field) {
      return ( !field ) || ( field.trim() === '' );
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
            if ( this.loginSuccess ) {
              // update user accepted terms and condition here. We should do this here after login because we need CreatedByDAO
              this.acceptanceDocumentService.
              updateUserAcceptanceDocument(this.__context__, this.user.id, this.termsAgreementDocument.id, this.termsAndConditions);

              this.acceptanceDocumentService.
              updateUserAcceptanceDocument(this.__context__, this.user.id, this.privacyDocument.id, this.termsAndConditions);
            }
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
    }
  ],

  actions: [
    {
      name: 'createNew',
      label: 'Create account',
      code: function(X, obj) {
        if ( ! this.validating() ) return;

        businessAddress = this.Address.create({
          countryId: this.country
        });

        var newUser = this.User.create({
          firstName: this.firstNameField,
          lastName: this.lastNameField,
          email: this.emailField,
          desiredPassword: this.passwordField,
          organization: this.companyNameField,
          signUpToken: this.signUpToken,
          // Address is removed from the user and used as the business address for the business created in
          // the smeRegistrationDAO
          businessAddress: businessAddress,
          // Don't send the "welcome to nanopay" email, send the email
          // verification email instead.
          welcomeEmailSent: true,
          group: 'sme'
        });

        this.smeBusinessRegistrationDAO
          .put(newUser)
          .then((user) => {
            this.user = user;
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
        this.privacyDocument = await this.acceptanceDocumentService.getAcceptanceDocument(this.__context__, this.PRIVACY_DOCUMENT_NAME, '');
      } catch (error) {
        console.warn('Error occured finding Terms Agreement: ', error);
      }
    }
  ]
});

