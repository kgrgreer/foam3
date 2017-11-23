foam.CLASS({
  package: 'net.nanopay.admin.ui.form',
  name: 'AddShopperInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input shopper information',

  imports: [
    'viewData',
    'goBack',
    'goNext',
    'regionDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .infoContainer {
          width: 496px;
          height: 350px;
          background: white;
          border-radius: 2px;
          overflow-y: scroll;
          padding: 20px;
        }
        ^ .labelTitle {
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
          color: #093649;
        }
        ^ .imageDiv {
          margin-bottom: 20px;
        }
        ^ .userImage {
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
        ^ .infoLabel {
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
        }
        ^ .inputLarge {
          width: 218px;
          height: 40px;
          margin-top: 8px;
          background-color: #ffffff;
          border: solid 1px rgba(164, 179, 184, 0.5);
          outline: none;
          padding: 10px;
          font-size: 14px;
        }
        ^ .topMargin {
          margin-top: 20px;
        }
      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Fill in shopper\'s info and create a password.' },
    { name: 'PersonalInformation', message: 'Personal Information' },
    { name: 'UploadImageLabel', message: 'Upload Image' },
    { name: 'UploadDesc', message: 'JPG, GIF, JPEG, BMP or PNG' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'EmailAddressLabel', message: 'Email Address' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' },
    { name: 'BirthdayLabel', message: 'Birthday' },
    { name: 'HomeAddressLabel', message: 'Home Address' },
    { name: 'StNoLabel', message: 'St No.' },
    { name: 'StNameLabel', message: 'St Name' },
    { name: 'AddressLineLabel', message: 'Address line' },
    { name: 'CityLabel', message: 'City' },
    { name: 'ProvinceLabel', message: 'Province' },
    { name: 'PostalCodeLabel', message: 'Postal Code' },
    { name: 'PasswordLabel', message: 'Password' },
    { name: 'CreateAPasswordLabel', message: 'Create a Password' }
  ],

  properties: [
    {
      class: 'String',
      name: 'firstName',
      postSet: function(oldValue, newValue) {
        this.viewData.firstName = newValue;
      }
    },
    {
      class: 'String',
      name: 'lastName',
      postSet: function(oldValue, newValue) {
        this.viewData.lastName = newValue;
      }
    },
    {
      class: 'String',
      name: 'emailAddress',
      postSet: function(oldValue, newValue) {
        this.viewData.emailAddress = newValue;
      }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      postSet: function(oldValue, newValue) {
        this.viewData.phoneNumber = newValue;
      }
    },
    {
      class: 'Date',
      name: 'birthday',
      tableCellFormatter: function(date) {
        this.add(date ? date.toISOString().substring(0,10) : '');
      }
    },
    {
      class: 'String',
      name: 'streetNumber',
      postSet: function(oldValue, newValue) {
        this.viewData.streetNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'streetName',
      postSet: function(oldValue, newValue) {
        this.viewData.streetName = newValue;
      }
    },
    {
      class: 'String',
      name: 'addressLine',
      postSet: function(oldValue, newValue) {
        this.viewData.addressLine = newValue;
      }
    },
    {
      class: 'String',
      name: 'city',
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
      }
    },
    {
      class: 'String',
      name: 'postalCode',
      postSet: function(oldValue, newValue) {
        this.viewData.postalCode = newValue;
      }
    },
    {
      class: 'String',
      name: 'password',
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').addClass('pDefault stepTopMargin').add(this.Step).end()
          .start().addClass('infoContainer')
            .start().addClass('labelTitle').add(this.PersonalInformation).end()
            .start().addClass('imageDiv')
              .start({ class: 'foam.u2.tag.Image', data: 'images/person.svg' }).addClass('userImage').end()
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