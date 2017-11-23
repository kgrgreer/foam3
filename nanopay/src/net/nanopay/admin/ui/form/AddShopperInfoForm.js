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

      */}
    })
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Fill in shopper\'s info and create a password.' },
    { name: 'PersonalInformation', message: 'Personal Information' },
    { name: 'UploadImage', message: 'Upload Image' },
    { name: 'FirstName', message: 'First Name' },
    { name: 'LastName', message: 'Last Name' },
    { name: 'EmailAddress', message: 'Email Address' },
    { name: 'PhoneNumber', message: 'Phone Number' },
    { name: 'Birthday', message: 'Birthday' },
    { name: 'HomeAddress', message: 'Home Address' },
    { name: 'StNo', message: 'St No.' },
    { name: 'StName', message: 'St Name' },
    { name: 'AddressLine', message: 'Address line' },
    { name: 'City', message: 'City' },
    { name: 'Province', message: 'Province' },
    { name: 'PostalCode', message: 'Postal Code' },
    { name: 'Password', message: 'Password' },
    { name: 'CreateAPassword', message: 'Create a Password' }
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
          .start('p').addClass('pDefault').add(this.Step).end()
        .end();
    }
  ]
});