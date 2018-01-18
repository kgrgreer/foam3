foam.CLASS({
  package: 'net.nanopay.admin.ui.form.shopper',
  name: 'AddShopperInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input shopper information',

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
    ^ .shopperImage {
      width: 80px;
      height: 80px;
      margin-top: 20px;
      display: inline-block;
    }
    ^ .net-nanopay-ui-ActionView-uploadImage {
      width: 136px;
      height: 40px;
      background: transparent;
      border: solid 1px #59a5d5;
      color: #59a5d5;
      margin: 0;
      outline: none;
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
    ^ .uploadButtonContainer {
      height: 80px;
      display: inline-block;
      vertical-align: text-bottom;
      margin-left: 40px;
    }
    ^ .uploadDescription {
      margin-top: 9px;
      font-size: 10px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: #093649;
    }
    ^ .topMargin {
      margin-top: 20px;
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
      class: 'String',
      name: 'firstName',
      factory: function() {
        return this.viewData.firstName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.firstName = newValue;
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
      }
    },
    {
      name: 'province',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.regionDAO,
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
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Fill in shopper\'s information, scroll down to continue and hit next when finished.' },
    { name: 'PersonalInformationLabel', message: 'Personal Information' },
    { name: 'UploadImageLabel', message: 'Upload Image' },
    { name: 'UploadDesc', message: 'JPG, GIF, JPEG, BMP or PNG' },
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
    { name: 'CreateAPasswordLabel', message: 'Create a Password *' }
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
            .start().addClass('bottomMargin')
              .start({ class: 'foam.u2.tag.Image', data: 'images/person.svg' }).addClass('shopperImage').end()
              .start().addClass('uploadButtonContainer')
                .add(this.UPLOAD_IMAGE)
                .start().add(this.UploadDesc).addClass('uploadDescription').end()
              .end()
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
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'uploadImage',
      label: this.UploadImageLabel,
      code: function(X) {
        //TODO: Add image upload functionality
      }
    }
  ]
});