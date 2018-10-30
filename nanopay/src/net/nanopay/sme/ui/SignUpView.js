foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'SignUpView',
  extends: 'foam.u2.Controller',

  documentation: 'User Sign up View for Ablii. For first time users.',

  imports: [
    'auth',
    'businessDAO',
    'ctrl',
    'stack',
    'user',
    'smeBusinessRegistrationDAO',
    'validateEmail',
    'validatePassword'
  ],

  requires: [
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.Element',
    'net.nanopay.model.Business',
    'net.nanopay.sme.ui.SplitBorder',
  ],

  css: `
    ^ {
      top: -10px;
      position: relative;
    }
    ^ .content-form {
      margin-top: 15vh;
      margin-right: 10vh;
      margin-left: 10vh;
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
      name: 'passwordField'
    }
  ],

  messages: [
    { name: 'TITLE', message: 'Create an account' },
    { name: 'SUBTITLE', message: 'Already have one?' },
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
      var split = net.nanopay.sme.ui.SplitBorder.create();

      var left = this.Element.create()
      // TO set image on Left Side:
      // 1) comment out '.addClass('img-replacement')'
      // 2) uncomment .start('img').addClass('sme-image').attr('src', 'images/placeholder-background.jpg').end()
      // 3) set the proper image location. Replacing 'images/placeholder-background.jpg'
        .addClass('img-replacement')
        // .start('img').addClass('sme-image').attr('src', 'images/placeholder-background.jpg').end()
        .start().addClass('sme-text-block')
          .start('h3').add(this.IMAGE_TEXT).end()
        .end();

      var right = this.Element.create()
        .addClass('content-form')
          .start().addClass('sme-registration-container')

            .start().add(this.TITLE).addClass('sme-title').end()

            .start().addClass('sme-subTitle')
              .start('span').add(this.SUBTITLE).end()
              .start('span').addClass('sme-link')
                .add('Sign in')
                .on('click', function() {
                  self.stack.push({ class: 'net.nanopay.sme.ui.SignInView' });
                })
              .end()
            .end()

            .start().addClass('sme-inputContainer')
              .start().addClass('sme-nameRowL')
                .start().add(this.F_NAME).addClass('sme-labels').end()
                .start(this.FIRST_NAME_FIELD).addClass('sme-nameFields').end()
              .end()
              .start().addClass('sme-nameRowR')
                .start().add(this.L_NAME).addClass('sme-labels').end()
                .start(this.LAST_NAME_FIELD).addClass('sme-nameFields').end()
              .end()
            .end()

            .start().addClass('sme-inputContainer')
              .start().add(this.C_NAME).addClass('sme-labels').end()
              .start(this.COMPANY_NAME_FIELD).addClass('sme-dataFields').end()
            .end()

            .start().addClass('sme-inputContainer')
              .start().add(this.B_PHONE).addClass('sme-labels').end()
              .start(this.BUSINESS_PHONE_FIELD).addClass('sme-dataFields').end()
            .end()

            .start().addClass('sme-inputContainer')
              .start().add(this.EMAIL).addClass('sme-labels').end()
              .start(this.EMAIL_FIELD).addClass('sme-dataFields').end()
            .end()

            .start().addClass('sme-inputContainer')
              .start().add(this.PASSWORD).addClass('sme-labels').end()
              .start(this.PASSWORD_FIELD).addClass('sme-property-password').end()
            .end()

            .start(this.CREATE_NEW).addClass('sme-button').end()

          .end();

      split.leftPanel.add(left);
      split.rightPanel.add(right);

      this.addClass(this.myClass()).add(split);
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
        this.add(this.NotificationMessage.create({ message: 'Password must contain one lowercase letter, one uppercase letter, one digit, and be between 7 and 32 characters in length.', type: 'error' }));
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
            this.ctrl.add(this.NotificationMessage.create({
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
        var self = this;
        var newUser = self.User.create({
          firstName: self.firstNameField,
          lastName: self.lastNameField,
          email: self.emailField,
          phone: self.makePhone(self.phoneField),
          desiredPassword: self.passwordField,
          organization: self.companyNameField,
          group: 'sme'
        });
        this.smeBusinessRegistrationDAO
          .put(newUser)
          .then((user) => {
            this.user = user;
            this.ctrl.add(this.NotificationMessage.create({
              message: 'User and business created.'
            }));
            this.logIn();
          })
          .catch((err) => {
            this.ctrl.add(this.NotificationMessage.create({
              message: err.message || 'There was a problem creating your account.',
              type: 'error'
            }));
          });
      }
    }
  ]
});
