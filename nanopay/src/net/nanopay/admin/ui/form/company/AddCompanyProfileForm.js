foam.CLASS({
  package: 'net.nanopay.admin.ui.form.company',
  name: 'AddCompanyProfileForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input business\'s business profile information',

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
    ^ .businessImage {
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
    ^ .rightMargin {
      margin-right: 10px;
    }
    ^ .infoContainer{
      height: 325px;
    }
    ^ .margin-left{
      margin-left: 60px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'businessName',
      factory: function() {
        return this.viewData.businessName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.businessName = newValue;
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
      name: 'issueAuthority',
      factory: function() {
        return this.viewData.issueAuthority;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.issueAuthority = newValue;
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
    }
  ],

  messages: [
    { name: 'Step', message: 'Step 2: Fill in the business\'s business profile. scroll down to continue and hit next when finished' },
    { name: 'BusinessInformationLabel', message: 'Business Information' },
    { name: 'UploadImageLabel', message: 'Upload Image' },
    { name: 'UploadDesc', message: 'JPG, GIF, JPEG, BMP or PNG' },
    { name: 'BusinessNameLabel', message: 'Business Name *' },
    { name: 'CountryLabel', message: 'Country *' },
    { name: 'CompanyEmailLabel', message: 'Company Email *' },
    { name: 'RegistrationNoLabel', message: 'Registration No. *' },
    { name: 'IssueAuthorityLabel', message: 'Issuing Authority '},
    { name: 'CompanyTypeLabel', message: 'Company Type *' },
    { name: 'BusinessSectorLabel', message: 'Business Sector *' },
    { name: 'WebsiteLabel', message: 'Website ' },
    { name: 'BusinessAddressLabel', message: 'Business Address' },
    { name: 'StNoLabel', message: 'St No. *' },
    { name: 'StNameLabel', message: 'St Name *' },
    { name: 'AddressLineLabel', message: 'Address line' },
    { name: 'CityLabel', message: 'City *' },
    { name: 'ProvinceLabel', message: 'Province *' },
    { name: 'PostalCodeLabel', message: 'Postal Code *' }
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
            .start().addClass('bottomMargin')
              .start({ class: 'foam.u2.tag.Image', data: 'images/business-placeholder.png' }).addClass('businessImage').end()
              .start().addClass('uploadButtonContainer')
                .add(this.UPLOAD_IMAGE)
                .start().add(this.UploadDesc).addClass('uploadDescription').end()
              .end()
            .end()
            .start().addClass('inline')
              .start().add(this.BusinessNameLabel).addClass('infoLabel').end()
              .start(this.BUSINESS_NAME).addClass('inputLarge').end()
            .end()
            // .start().addClass('inline float-right')
            //   .start().add(this.CompanyEmailLabel).addClass('infoLabel').end()
            //   .start(this.COMPANY_EMAIL).addClass('inputLarge').end()
            // .end()
            .start().addClass('inline margin-left')
              .start().add(this.RegistrationNoLabel).addClass('infoLabel topMargin').end()
              .start(this.REGISTRATION_NUMBER).addClass('inputLarge').end()
            .end()
            .start().addClass('inline')
              .start().add(this.CompanyTypeLabel).addClass('infoLabel').end()
              .tag(this.BUSINESS_TYPE)
              .start().addClass('caret').end()
            .end()
            .start().addClass('inline topMargin margin-left')
              .start().add(this.BusinessSectorLabel).addClass('infoLabel topMargin').end()
              .tag(this.BUSINESS_SECTOR)
              .start().addClass('caret').end()
            .end()
            .start().add(this.HomeAddressLabel).addClass('labelTitle topMargin').end()
            .start().addClass('float-right')
              .start().add(this.WebsiteLabel).addClass('infoLabel').end()
              .start(this.WEBSITE).addClass('inputLarge').end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.IssueAuthorityLabel).addClass('infoLabel').end()
              .start(this.ISSUE_AUTHORITY).addClass('inputLarge').end()
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
            .start().addClass('topMargin float-right')
              .start().add(this.PostalCodeLabel).addClass('infoLabel').end()
              .start(this.POSTAL_CODE).addClass('inputLarge').end()
            .end()
            .start().addClass('inline topMargin')
              .start().add(this.CountryLabel).addClass('infoLabel').end()
              .tag(this.COUNTRY)
            .start().addClass('caret').end()
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