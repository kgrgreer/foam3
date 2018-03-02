foam.CLASS({
  package: 'net.nanopay.admin.ui.form.shopper',
  name: 'AddShopperInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input shopper information',

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'viewData',
    'goBack',
    'goNext',
    'regionDAO'
  ],

  css:`
    ^ .labelTitle {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #093649;
    }
    ^ .foam-u2-tag-Select {
      width: 218px;
      height: 40px;
      margin-top: 8px;
      border-radius: 0;
      -webkit-appearance: none;
      -moz-appearance: none;
      appearance: none;
      padding: 0 15px;
      border: solid 1px rgba(164, 179, 184, 0.5);
      background-color: white;
      outline: none;
      cursor: pointer;
      font-size: 14px;
    }
    ^ .provinceContainer {
      position: relative;
    }
    ^ .caret {
      position: relative;
    }
    ^ .caret:before {
      content: '';
      position: absolute;
      top: -22px;
      left: 190px;
      border-top: 7px solid #a4b3b8;
      border-left: 7px solid transparent;
      border-right: 7px solid transparent;
    }
    ^ .caret:after {
      content: '';
      position: absolute;
      left: 12px;
      top: 0;
      border-top: 0px solid #ffffff;
      border-left: 0px solid transparent;
      border-right: 0px solid transparent;
    }
    ^ .topMargin {
      margin-top: 20px;
    }
    ^ .bottomMargin {
      margin-botton: 20px;
    }
    ^ .rightMargin {
      margin-right: 10px;
    }
    ^ .infoContainer{
      height: 325px;
    }
  `,

  properties: [
    {
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView' },
      factory: function () {
        return this.viewData.profilePicture;
      },
      postSet: function (oldValue, newValue) {
        this.viewData.profilePicture = newValue;
      }
    },
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
      name: 'emailAddress',
      factory: function() {
        return this.viewData.emailAddress;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.emailAddress = newValue;
      },
      validateObj: function(email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ( ! emailRegex.test(email) ) {
          return this.EmailError;
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
      class: 'Date',
      name: 'birthday',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      },
      factory: function() {
        return this.viewData.birthday;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.birthday = newValue;
      }
    },
    {
      class: 'String',
      name: 'streetNumber',
      factory: function() {
        return this.viewData.streetNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.streetNumber = newValue;
      },
      validateObj: function (streetNumber) {
        var streetNumberRegex = /^[0-9]{1,16}$/;

        if ( ! streetNumberRegex.test(streetNumber) ) {
          return this.StreetNumberError;
        }
      }
    },
    {
      class: 'String',
      name: 'streetName',
      factory: function() {
        return this.viewData.streetName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.streetName = newValue;
      },
      validateObj: function (streetName) {
        if ( streetName.length > 70 ) {
          return this.StreetNameError;
        }
      }
    },
    {
      class: 'String',
      name: 'addressLine',
      factory: function() {
        return this.viewData.addressLine;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.addressLine = newValue;
      },
      validateObj: function(addressLine) {
        if ( ! addressLine || addressLine > 70 ) {
          return this.AddressError;
        }
      }
    },
    {
      class: 'String',
      name: 'city',
      factory: function() {
        return this.viewData.city;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.city = newValue;
      },
      validateObj: function (city) {
        var cityRegex = /^[a-zA-Z]{1,35}$/;

        if ( ! cityRegex.test(city) ) {
          return this.AddressCityError;
        }
      }
    },
    {
      name: 'province',
      view: function(_, X) {
        var expr = foam.mlang.Expressions.create();
        return foam.u2.view.ChoiceView.create({
          dao: X.regionDAO.where(expr.EQ(foam.nanos.auth.Region.COUNTRY_ID, 'CA')),
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        return this.viewData.province;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.province = newValue;
      },
      validateObj: function(province) {
        if ( ! province || province.name.length > 35 ) {
          return this.AddressProvinceError;
        }
      }
    },
    {
      class: 'String',
      name: 'postalCode',
      factory: function() {
        return this.viewData.postalCode;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.postalCode = newValue;
      },
      validateObj: function(postalCode) {
        var postalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

        if ( ! postalCodeRegex.test(postalCode) ) {
          return this.AddressPostalCodeError;
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
    { name: 'Step', message: 'Step 1: Fill in shopper\'s information, scroll down to continue and hit next when finished.' },
    { name: 'PersonalInformationLabel', message: 'Personal Information' },
    { name: 'FirstNameLabel', message: 'First Name *' },
    { name: 'LastNameLabel', message: 'Last Name *' },
    { name: 'EmailAddressLabel', message: 'Email Address *' },
    { name: 'PhoneNumberLabel', message: 'Phone Number *' },
    { name: 'BirthdayLabel', message: 'Birthday *' },
    { name: 'HomeAddressLabel', message: 'Home Address' },
    { name: 'StNoLabel', message: 'St No. *' },
    { name: 'StNameLabel', message: 'St Name *' },
    { name: 'AddressLineLabel', message: 'Address line' },
    { name: 'CityLabel', message: 'City *' },
    { name: 'ProvinceLabel', message: 'Province *' },
    { name: 'PostalCodeLabel', message: 'Postal Code *' },
    { name: 'PasswordLabel', message: 'Password' },
    { name: 'CreateAPasswordLabel', message: 'Create a Password *' },
    { name: 'ConfirmPasswordLabel', message: 'Confirm Password *' },
    { name: 'FormError', message: 'Error while saving your changes. Please review your input and try again.' },
    { name: 'FirstNameError', message: 'Invalid first name.' },
    { name: 'LastNameError', message: 'Invalid last name.' },
    { name: 'EmailError', message: 'Invalid email address.' },
    { name: 'PhoneError', message: 'Invalid phone number.' },
    { name: 'StreetNameError', message: 'Invalid street name.' },
    { name: 'StreetNumberError', message: 'Invalid street number.' },
    { name: 'AddressError', message: 'Street address is invalid.' },
    { name: 'AddressCityError', message: 'City name is invalid.' },
    { name: 'AddressProvinceError', message: 'Invalid province option.' },
    { name: 'AddressPostalCodeError', message: 'Invalid postal code.' },
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
            .start().add(this.PersonalInformationLabel).addClass('labelTitle').end()
            .start().addClass('topMargin bottomMargin')
              .add(this.PROFILE_PICTURE)
            .end()
            .start().addClass('inline')
              .start().add(this.FirstNameLabel).addClass('infoLabel').end()
              .start(this.FIRST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(this.LastNameLabel).addClass('infoLabel').end()
              .start(this.LAST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline topMargin')
              .start().add(this.EmailAddressLabel).addClass('infoLabel').end()
              .start(this.EMAIL_ADDRESS).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right topMargin')
              .start().add(this.PhoneNumberLabel).addClass('infoLabel').end()
              .start(this.PHONE_NUMBER).addClass('inputLarge').end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.BirthdayLabel).addClass('infoLabel').end()
              .start(this.BIRTHDAY).addClass('inputLarge').end()
            .end()
            .start().add(this.HomeAddressLabel).addClass('labelTitle topMargin').end()
            .start().addClass('inline rightMargin')
              .start().add(this.StNoLabel).addClass('infoLabel').end()
              .start(this.STREET_NUMBER).addClass('inputSmall').end()
            .end()
            .start().addClass('inline topMargin')
              .start().add(this.StNameLabel).addClass('infoLabel').end()
              .start(this.STREET_NAME).addClass('inputMedium').end()
            .end()
            .start().addClass('inline topMargin float-right')
              .start().add(this.AddressLineLabel).addClass('infoLabel').end()
              .start(this.ADDRESS_LINE).addClass('inputLarge').end()
            .end()
            .start().addClass('inline topMargin')
              .start().add(this.CityLabel).addClass('infoLabel').end()
              .start(this.CITY).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right topMargin')
              .start().addClass('provinceContainer')
                .start().add(this.ProvinceLabel).addClass('infoLabel').end()
                .tag(this.PROVINCE)
                .start().addClass('caret').end()
              .end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.PostalCodeLabel).addClass('infoLabel').end()
              .start(this.POSTAL_CODE).addClass('inputLarge').end()
            .end()
            .start().add(this.PasswordLabel).addClass('labelTitle topMargin').end()
            .start().addClass('topMargin')
              .start().add(this.CreateAPasswordLabel).addClass('infoLabel').end()
              .start(this.PASSWORD).addClass('inputExtraLarge').end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.ConfirmPasswordLabel).addClass('infoLabel').end()
              .start(this.CONFIRM_PASSWORD).addClass('inputExtraLarge').end()
            .end()
          .end()
        .end();
    }
  ]
});
