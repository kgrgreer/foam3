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
        var hasOkLength = firstName.length >= 1 && firstName.length <= 70;

        if ( ! firstName || ! hasOkLength ) {
          return this.FormError;
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
        var hasOkLength = lastName.length >= 1 && lastName.length <= 70;

        if ( ! lastName || ! hasOkLength ) {
          return this.FormError;
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
    { name: 'FormError', message: 'Error while saving your changes. Please review your input and try again.' }
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