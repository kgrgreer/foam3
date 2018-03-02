foam.CLASS({
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input merchant information',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  css:`
    ^ .labelTitle {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #093649;
      margin-bottom: 20px;
    }
    ^ .topMargin {
      margin-top: 20px;
    }
    ^ .rightMargin {
      margin-right: 10px;
    }
    ^ .infoContainer{
      height: 285px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'firstName',
      factory: function() {
        return this.viewData.firstName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.firstName = newValue;
      },
      validateObj: function(firstName) {
        var firstNameRegex = /^[a-zA-Z]{1,70}$/;

        if ( ! firstNameRegex.test(firstName) ) {
          return this.FirstNameError;
        }
      }
    },
    {
      class: 'String',
      name: 'lastName',
      factory: function() {
        return this.viewData.lastName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.lastName = newValue;
      },
      validateObj: function(lastName) {
        var lastNameRegex = /^[a-zA-Z]{1,70}$/;

        if ( ! lastNameRegex.test(lastName) ) {
          return this.LastNameError;
        }
      }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      factory: function() {
        return this.viewData.phoneNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.phoneNumber = newValue;
      },
      validateObj: function (number) {
        var numberRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
        
        if ( ! numberRegex.test(number) ) {
          return this.PhoneError;
        }
      }
    },
    {
      class: 'Password',
      name: 'password',
      factory: function() {
        return this.viewData.password;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      },
      validateObj: function (password) {
        var passwordRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9]).{7,32}$/;

        if ( ! passwordRegex.test(password) ) {
          return this.PasswordError;
        }
      }
    },
    {
      class: 'String',
      name: 'confirmPassword',
      factory: function() {
        return this.viewData.confirmPassword;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.confirmPassword = newValue;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Fill in merchant\'s information and create a password.' },
    { name: 'MerchantInformationLabel', message: 'Merchant Information' },
    { name: 'FirstNameLabel', message: 'First Name *' },
    { name: 'LastNameLabel', message: 'Last Name *' },
    { name: 'PhoneNumberLabel', message: 'Phone Number *' },
    { name: 'PasswordLabel', message: 'Password *' },
    { name: 'ConfirmPasswordLabel', message: 'Confirm Password *' },
    { name: 'FormError', message: 'Error while saving your changes. Please review your input and try again.' },
    { name: 'FirstNameError', message: 'Invalid first name.' },
    { name: 'LastNameError', message: 'Invalid last name.' },
    { name: 'PhoneError', message: 'Invalid phone number.' },
    { name: 'PasswordError', message: 'Password must contain at least one lowercase letter, one uppercase letter, one digit, and be between 7 and 32 characters in length.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').addClass('pDefault stepTopMargin').add(this.Step).end()
          .start().addClass('infoContainer')
            .start().add(this.MerchantInformationLabel).addClass('labelTitle').end()
            .start().addClass('inline')
              .start().add(this.FirstNameLabel).addClass('infoLabel').end()
              .start(this.FIRST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(this.LastNameLabel).addClass('infoLabel').end()
              .start(this.LAST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline topMargin')
              .start().add(this.PhoneNumberLabel).addClass('infoLabel').end()
              .start(this.PHONE_NUMBER).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right topMargin')
              .start().add(this.PasswordLabel).addClass('infoLabel').end()
              .start(this.PASSWORD).addClass('inputLarge').end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.ConfirmPasswordLabel).addClass('infoLabel').end()
              .start(this.CONFIRM_PASSWORD).addClass('inputLarge').end()
            .end()
          .end()
        .end();
    }
  ]
});