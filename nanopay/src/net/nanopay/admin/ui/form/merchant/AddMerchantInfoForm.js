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

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
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
          height: 272px;
        }
      */}
    })
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
      class: 'String',
      name: 'password',
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      }
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 1: Fill in merchant\'s information and create a password.' },
    { name: 'MerchantInformationLabel', message: 'Merchant Information' },
    { name: 'FirstNameLabel', message: 'First Name *' },
    { name: 'LastNameLabel', message: 'Last Name *' },
    { name: 'EmailAddressLabel', message: 'Email Address *' },
    { name: 'PhoneNumberLabel', message: 'Phone Number *' },
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
              .start().add(this.EmailAddressLabel).addClass('infoLabel').end()
              .start(this.EMAIL_ADDRESS).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right topMargin')
              .start().add(this.PhoneNumberLabel).addClass('infoLabel').end()
              .start(this.PHONE_NUMBER).addClass('inputLarge').end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.CreateAPasswordLabel).addClass('infoLabel').end()
              .start(this.PASSWORD).addClass('inputExtraLarge').end()
            .end()
          .end()
        .end();
    }
  ]
});