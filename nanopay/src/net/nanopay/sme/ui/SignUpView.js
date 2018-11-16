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
    'smeBusinessRegistrationDAO',
    'stack',
    'user',
    'validateAddress',
    'validateCity',
    'validateEmail',
    'validatePassword',
    'validatePhone',
    'validatePostalCode',
    'validateStreetNumber',
    'countryDAO',
    'regionDAO',
    'businessTypeDAO'
  ],

  exports: [
    'as data'
  ],

  requires: [
    'foam.nanos.auth.Country',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.model.Business',
    'net.nanopay.sme.ui.SplitBorder',
    'net.nanopay.ui.NewPasswordView',
  ],

  css: `
<<<<<<< HEAD
    ^ {
      position: relative;
    }
=======
>>>>>>> origin/development
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
      name: 'businessPhoneField'
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
      class: 'Boolean',
      name: 'isFullSignup'
    },
    {
      class: 'String',
      name: 'streetNumber'
    },
    {
      class: 'String',
      name: 'streetName'
    },
    {
      class: 'String',
      name: 'additionalAddress'
    },
    {
      class: 'String',
      name: 'city'
    },
    {
      class: 'String',
      name: 'region',
      view: function(_, X) {
        var choices = X.data.slot(function(country) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, country || ""));
        });
        return {
          class: 'foam.u2.view.ChoiceView',
          dao$: choices,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        };
      },
    },

    {
      class: 'String',
      name: 'country',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.ChoiceView',
          dao: X.countryDAO.where(
            X.data.OR(X.data.EQ(X.data.Country.CODE, 'CA'), X.data.EQ(X.data.Country.CODE, 'US'))),
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        };
      },
    },
    {
      class: 'String',
      name: 'postalCode'
    },
    {
      name: 'businessType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessTypeDAO,
          objToChoice: function(item) {
            return [item.id, item.name];
          }
        });
      }
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Create a free account' },
    { name: 'SUBTITLE', message: 'Already have an account?' },
    { name: 'F_NAME', message: 'First Name' },
    { name: 'L_NAME', message: 'Last Name' },
    { name: 'C_NAME', message: 'Company Name' },
    { name: 'B_PHONE', message: 'Business Phone' },
    { name: 'EMAIL', message: 'Email Address' },
    { name: 'PASSWORD', message: 'Password' },
    { name: 'IMAGE_TEXT', message: 'Text For Image :)' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;
      var emailLabel = this.isFullSignup ? `Default ${this.EMAIL}` : this.EMAIL;
      var disaled = this.isFullSignup ?
          foam.u2.DisplayMode.DISABLED : foam.u2.DisplayMode.RW;
      var split = net.nanopay.sme.ui.SplitBorder.create();

      var left = this.Element.create();
      // TO set image on Left Side:
      // 1) comment out '.addClass('img-replacement')'
      // 2) uncomment .start('img').addClass('sme-image').attr('src', 'images/placeholder-background.jpg').end()
      // 3) set the proper image location. Replacing 'images/placeholder-background.jpg'
        // .start('img').addClass('sme-image').attr('src', 'images/placeholder-background.jpg').end()
        // .start().addClass('sme-text-block')
        //   .start('h3').add(this.IMAGE_TEXT).end()
        // .end();

      var right = this.Element.create()
        .addClass('content-form')
          .start().addClass('sme-registration-container')
            .start('img').addClass('login-logo-img').attr('src', 'images/ablii-wordmark.svg').end()
            .start().add(this.TITLE).addClass('sme-title').end()


            .start().addClass('input-wrapper')
              .start().addClass('input-double-left')
                .start().add(this.F_NAME).addClass('input-label').end()
                .start(this.FIRST_NAME_FIELD).addClass('input-field').end()
              .end()
              .start().addClass('input-double-right')
                .start().add(this.L_NAME).addClass('input-label').end()
                .start(this.LAST_NAME_FIELD).addClass('input-field').end()
              .end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.C_NAME).addClass('input-label').end()
              .start(this.COMPANY_NAME_FIELD).addClass('input-field').end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.B_PHONE).addClass('input-label').end()
              .start(this.BUSINESS_PHONE_FIELD).addClass('input-field').end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.EMAIL).addClass('input-label').end()
              .start(this.EMAIL_FIELD).addClass('input-field').end()
            .end()

            .start().addClass('input-wrapper')
              .start().add(this.PASSWORD).addClass('input-label').end()
              .start(this.PASSWORD_FIELD).end()
            .end()

            .start().show(this.isFullSignup$)
              .start().addClass('sme-inputContainer')
                .start().addClass('sme-nameRowL')
                  .start().add('Street number').addClass('sme-labels').end()
                  .start(this.STREET_NUMBER).addClass('sme-half-field').end()
                .end()
                .start().addClass('sme-nameRowR')
                  .start().add('Street name').addClass('sme-labels').end()
                  .start(this.STREET_NAME).addClass('sme-half-field').end()
                .end()
              .end()
              .start().addClass('sme-inputContainer')
                .start().addClass('sme-nameRowL')
                  .start().add('Addtional (unit/apt)').addClass('sme-labels').end()
                  .start(this.ADDITIONAL_ADDRESS).addClass('sme-half-field').end()
                .end()
                .start().addClass('sme-nameRowR')
                  .start().add('City').addClass('sme-labels').end()
                  .start(this.CITY).addClass('sme-half-field').end()
                .end()
              .end()
              .start().addClass('sme-inputContainer')
                .start().addClass('sme-nameRowL')
                  .start().add('Province/State').addClass('sme-labels').end()
                  .start(this.REGION).end()
                .end()
                .start().addClass('sme-nameRowR')
                  .start().add('Country').addClass('sme-labels').end()
                  .start(this.COUNTRY).end()
                .end()
              .end()
              .start().addClass('sme-inputContainer')
                .start().addClass('sme-nameRowL')
                  .start().add('Postal/zip code').addClass('sme-labels').end()
                  .start(this.POSTAL_CODE).addClass('sme-half-field').end()
                .end()
                .start().addClass('sme-nameRowR')
                  .start().add('Type of business').addClass('sme-labels').end()
                  .start(this.BUSINESS_TYPE).end()
                .end()
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

      this.addClass(this.myClass()).addClass('full-screen').add(split);
    },

    function makePhone(phoneNumber) {
      return this.Phone.create({ number: phoneNumber });
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
      if ( this.isEmpty(this.businessPhoneField) ) {
        this.add(this.NotificationMessage.create({ message: 'Business Phone Field Required.', type: 'error' }));
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
      if ( ! (/^\d{3}?[\-]?\d{3}[\-]?\d{4}$/).test(this.businessPhoneField) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid phone number.', type: 'error' }));
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
      if ( ! this.validateStreetNumber(this.streetNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street number.', type: 'error' }));
        return false;
      }
      if ( ! this.validateAddress(this.streetName) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street name.', type: 'error' }));
        return false;
      }
      if ( this.additionalAddress.length > 0 && ! this.validateAddress(this.additionalAddress) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid address line.', type: 'error' }));
        return false;
      }
      if ( ! this.validateCity(this.city) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid city name.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePostalCode(this.postalCode) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid postal code.', type: 'error' }));
        return false;
      }
      return true;
    },

    function isEmpty(field) {
      field = field.trim();
      if ( field === '' ) return true;
      return false;
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
            }
          }
        })
        .catch((err) => {
          ctrl.add(this.NotificationMessage.create({
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
          phone: this.makePhone(this.phoneField),
          desiredPassword: this.passwordField,
          organization: this.companyNameField,
          group: 'sme'
        });

        if ( this.isFullSignup ) {
          newUser.businessAddress.suite = this.additionalAddress;
          newUser.businessAddress.streetNumber = this.streetNumber;
          newUser.businessAddress.streetName = this.streetName;
          newUser.businessAddress.city = this.city;
          newUser.businessAddress.regionId = this.region;
          newUser.businessAddress.countryId = this.country;
          newUser.businessAddress.postalCode = this.postalCode;
          newUser.businessTypeId = this.businessType;
        }

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
