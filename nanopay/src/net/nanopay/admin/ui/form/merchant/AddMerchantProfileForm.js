foam.CLASS({
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantProfileForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input merchant\'s business profile information',

  imports: [
    'viewData',
    'goBack',
    'goNext',
    'businessTypeDAO',
    'businessSectorDAO',
    'countryDAO',
    'regionDAO'
  ],

  css:`
    ^ .labelTitle {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #093649;
    }
    ^ .merchantImage {
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
      padding-left: 15px;
      padding-right: 30px;
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
      name: 'businessName',
      factory: function() {
        return this.viewData.businessName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.businessName = newValue;
      },
      validateObj: function(businessName) {
        if ( ! businessName || businessName.length > 35 ) {
          return this.BusinessNameError;
        }
      }
    },
    {
      name: 'country',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        return this.viewData.country || 'CA';
      },
      postSet: function(oldValue, newValue) {
        this.viewData.country = newValue;
      }
    },
    {
      class: 'String',
      name: 'companyEmail',
      factory: function() {
        return this.viewData.companyEmail;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.companyEmail = newValue;
      }
    },
    {
      class: 'String',
      name: 'registrationNumber',
      factory: function() {
        return this.viewData.registrationNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.registrationNumber = newValue;
      }
    },
    {
      name: 'businessType',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessTypeDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        return this.viewData.businessType;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.businessType = newValue;
      }
    },
    {
      name: 'businessSector',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessSectorDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        return this.viewData.businessSector;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.businessSector = newValue;
      }
    },
    {
      class: 'String',
      name: 'website',
      factory: function() {
        return this.viewData.website;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.website = newValue;
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
      validateObj: function(city) {
        if ( ! city || city.length > 35 ) {
          return this.AddressCityError;
        }
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
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 2: Fill in the merchant\'s business profile. scroll down to continue and hit next when finished' },
    { name: 'BusinessInformationLabel', message: 'Business Information' },
    { name: 'BusinessNameLabel', message: 'Business Name *' },
    { name: 'CountryLabel', message: 'Country *' },
    { name: 'CompanyEmailLabel', message: 'Business Email *' },
    { name: 'RegistrationNoLabel', message: 'Registration No. *' },
    { name: 'CompanyTypeLabel', message: 'Business Type *' },
    { name: 'BusinessSectorLabel', message: 'Business Sector *' },
    { name: 'WebsiteLabel', message: 'Website' },
    { name: 'BusinessAddressLabel', message: 'Business Address' },
    { name: 'StNoLabel', message: 'St No. *' },
    { name: 'StNameLabel', message: 'St Name *' },
    { name: 'AddressLineLabel', message: 'Address line' },
    { name: 'CityLabel', message: 'City *' },
    { name: 'ProvinceLabel', message: 'Province *' },
    { name: 'PostalCodeLabel', message: 'Postal Code *' },
    { name: 'BusinessNameError', message: 'Business name should have less than 35 characters' },
    { name: 'AddressError', message: 'Street address is invalid' },
    { name: 'AddressCityError', message: 'City name is invalid' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').addClass('pDefault stepTopMargin').add(this.Step).end()
          .start().addClass('infoContainer')
            .start().add(this.BusinessInformationLabel).addClass('labelTitle').end()
            .start().addClass('topMargin bottomMargin')
              .add(this.PROFILE_PICTURE)
            .end()
            .start().addClass('inline')
              .start().add(this.BusinessNameLabel).addClass('infoLabel').end()
              .start(this.BUSINESS_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(this.CompanyEmailLabel).addClass('infoLabel').end()
              .start(this.COMPANY_EMAIL).addClass('inputLarge').end()
            .end()
            .start().addClass('inline topMargin')
              .start().add(this.CountryLabel).addClass('infoLabel').end()
              .tag(this.COUNTRY)
              .start().addClass('caret').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(this.RegistrationNoLabel).addClass('infoLabel topMargin').end()
              .start(this.REGISTRATION_NUMBER).addClass('inputLarge').end()
            .end()
            .start().addClass('inline topMargin')
              .start().add(this.CompanyTypeLabel).addClass('infoLabel').end()
              .tag(this.BUSINESS_TYPE)
              .start().addClass('caret').end()
            .end()
            .start().addClass('inline float-right')
              .start().add(this.BusinessSectorLabel).addClass('infoLabel topMargin').end()
              .tag(this.BUSINESS_SECTOR)
              .start().addClass('caret').end()
            .end()
            .start().add(this.HomeAddressLabel).addClass('labelTitle topMargin').end()
            .start().addClass('topMargin')
              .start().add(this.WebsiteLabel).addClass('infoLabel').end()
              .start(this.WEBSITE).addClass('inputLarge').end()
            .end()
            .start().add(this.BusinessAddressLabel).addClass('labelTitle topMargin').end()
            .start().addClass('inline topMargin rightMargin')
              .start().add(this.StNoLabel).addClass('infoLabel').end()
              .start(this.STREET_NUMBER).addClass('inputSmall').end()
            .end()
            .start().addClass('inline')
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
