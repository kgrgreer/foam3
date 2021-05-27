/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'BusinessProfileForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input Business Profile information',

  imports: [
    'countryDAO',
    'regionDAO'
  ],

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Region',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Address'
  ],

  css: `
    ^ .foam-u2-TextField,
    ^ .foam-u2-DateView,
    ^ .foam-u2-tag-Select {

      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      border-radius: 0;

      padding: 12px 13px;

      box-sizing: border-box;
      outline: none;

      -webkit-appearance: none;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .foam-u2-tag-Select {
      width: 100%;
    }

    ^ .foam-u2-TextField:focus,
    ^ .foam-u2-DateView:focus,
    ^ .foam-u2-tag-Select:focus,
    ^ .foam-u2-ActionView:focus {
      border: solid 1px #59A5D5;
    }

    ^ .foam-u2-TextField:disabled,
    ^ .foam-u2-DateView:disabled,
    ^ .foam-u2-tag-Select:disabled,
    ^ .foam-u2-ActionView:disabled {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
      color: #a4b3b8 !important;
    }

    ^ .caret {
      position: relative;
      pointer-events: none;
    }

    ^ .caret:before {
      content: '';
      position: absolute;
      top: -23px;
      left: 510px;
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

    ^ .widthWrapper {
      width: 540px;
    }

    ^ .fullWidthField {
      width: 100%; /* based on wrapper */
    }

    ^ .fieldVerticalSpacer {
      padding-top: 20px;
    }

    ^ .sectionTitle {
      line-height: 16px;
      font-size: 14px;
      font-weight: bold;

      margin-top: 30px;
      margin-bottom: 20px;
    }

    ^ .sectionTitle:first-child {
      margin-top: 0;
    }

    ^ .fieldLabel {
      margin: 0;
      margin-bottom: 8px;

      color: /*%BLACK%*/ #1e1f21;
      font-weight: 300;
    }

    ^ .animationContainer {
      position: relative;
      height: 64px;
      overflow: hidden;
      box-sizing: border-box;
    }

    ^ .displayContainer {
      position: absolute;
      top: 0;
      left: 0;

      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;

      z-index: 10;
    }

    ^ .displayContainer.hidden {
      left: 540px;
      opacity: 0;
    }

    ^ .displayOnly {
      border: solid 1px rgba(164, 179, 184, 0.5) !important;
    }

    ^ .inputContainer {
      position: absolute;
      top: 0;
      left: 0;

      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      z-index: 9;
    }

    ^ .inputContainer.hidden {
      pointer-events: none;
      opacity: 0;
    }

    ^ .phoneNumberFieldsCol {
      display: inline-block;
      vertical-align: middle;

      height: 64px;

      opacity: 1;
      box-sizing: border-box;

      margin-right: 20px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .phoneNumberFieldsCol:last-child {
      margin-right: 0;
    }

    ^ .phoneNumberFieldsCol p {
      margin: 0;
      margin-bottom: 8px;
    }

    ^ .phoneNumberFieldsCol.out {
      opacity: 0;
      transform: translateX(-166.66px);
    }

    ^ .phoneCountryCodeCol {
      width: 105px;
      pointer-events: none;
    }

    ^ .phoneNumberCol {
      width: 415px;
    }

    ^ .businessTypeInfoContainer {
      min-height: 60px;
      background-color: #cee6f5;
      border: solid 1px #59a5d5;
      padding: 20px;

      box-sizing: border-box;

      margin-top: 20px;

      -webkit-transition: all .15s linear;
      -moz-transition: all .15s linear;
      -ms-transition: all .15s linear;
      -o-transition: all .15s linear;
      transition: all 0.15s linear;
    }

    ^ .businessTypeInfoContainer.hidden {
      margin-top: 0;
      opacity: 0;
      height: 0;
      min-height: 0;
      padding: 0 20px;
    }

    ^ .businessTypeInfoContainer.hidden .icon,
    ^ .businessTypeInfoContainer.hidden .businessTypeInfo {
      opacity: 0;
    }

    ^ .icon {
      width: 20px;
      height: 20px;

      display: inline-block;
      vertical-align: middle;
    }

    ^ .businessTypeInfo {
      /* 40px padding | 20px for icon | 10px for margin */
      width: calc(100% - 40px - 20px - 10px);

      margin: 0;
      margin-left: 10px;

      font-size: 12px;

      display: inline-block;
      vertical-align: middle;

      color: /*%BLACK%*/ #1e1f21;
    }

    ^ .streetFieldCol {
      display: inline-block;
      margin-right: 20px;
    }

    ^ .streetFieldCol:last-child {
      margin-right: 0;
    }

    ^ .streetNumberField {
      width: 125px;
    }

    ^ .streetNameField {
      width: 395px;
    }

    ^ .foam-nanos-auth-ProfilePictureView {
      background-color: white;
    }

    ^ .address2Hint {
      height: 14px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.17;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-top: 5px;
      margin-bottom: 0px;
    }
  `,

  messages: [
    { name: 'BusinessInformationSubtitle', message: 'Business Information' },
    { name: 'BusinessAddressSubtitle', message: 'Business Information' },
    { name: 'BusinessNameLabel', message: 'Registered Business Name' },
    { name: 'BusinessPhoneLabel', message: 'Business Phone' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Business Phone Number' },
    { name: 'WebsiteLabel', message: 'Website (optional)' },
    { name: 'BusinessTypeLabel', message: 'Business Type' },
    { name: 'BusinessRegistrationNumberLabel', message: 'Business Registration Number' },
    { name: 'RegistrationAuthorityLabel', message: 'Registration Authority' },
    { name: 'RegistrationDateLabel', message: 'Registration Date' },
    { name: 'BusinessAddressLabel', message: 'Business Address' },
    { name: 'CountryLabel', message: 'Country' },
    { name: 'StreetNumberLabel', message: 'Street Number' },
    { name: 'StreetNameLabel', message: 'Street Name' },
    { name: 'Address2Label', message: 'Address 2 (optional)' },
    { name: 'Address2Hint', message: 'Apartment, suite, unit, building, floor, etc.' },
    { name: 'ProvinceLabel', message: 'Province' },
    { name: 'CityLabel', message: 'City' },
    { name: 'PostalCodeLabel', message: 'Postal Code' },
    { name: 'BusinessProfilePictureSubtitle', message: 'Business Logo (optional)' },
    { name: 'BusinessTypeDescriptionSole', message: 'A sole proprietorship is an unincorporated business owned by an individual.' },
    { name: 'BusinessTypeDescriptionPart', message: 'A partnership is an unincorporated business owned by two or more persons, carrying on business together, generally for profit.' },
    { name: 'BusinessTypeDescriptionCorp', message: 'A private or public corporation is a legal entity that is separate and distinct from its owners, shareholders of the corporation, directors and officers.' },
    { name: 'BusinessTypeDescriptionNonP', message: 'An not-for-profit (organization) is a provincially or federally incorporated organization that provides products or services without making profit. They are generally dedicated to activities that improve or benefit a community.' },
  ],

  properties: [
    {
      class: 'String',
      name: 'businessNameField',
      factory: function() {
        if ( this.viewData.user.businessName ) return this.viewData.user.businessName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.businessName = newValue.trim();
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingPhone',
      value: false,
      postSet: function(oldValue, newValue) {
        this.displayedPhoneNumber = '';
        if ( this.phoneCountryCodeField ) this.displayedPhoneNumber += this.phoneCountryCodeField;
        if ( this.phoneNumberField ) this.displayedPhoneNumber += ' ' + this.phoneNumberField;
      }
    },
    {
      class: 'String',
      name: 'displayedPhoneNumber',
      value: '+1'
    },
    {
      class: 'String',
      name: 'phoneCountryCodeField',
      value: '+1'
    },
    'phoneNumberFieldElement',
    {
      class: 'String',
      name: 'phoneNumberField',
      factory: function() {
        return this.viewData.user.phoneNumber ? this.viewData.user.phoneNumber.substring(2) : '';
      },
      postSet: function(oldValue, newValue) {
        this.isEditingPhone = false;
        this.viewData.user.phoneNumber = '+1 ' + newValue;
      }
    },
    {
      class: 'String',
      name: 'websiteField',
      factory: function() {
        if ( this.viewData.user.website ) return this.viewData.user.website;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.website = newValue.trim();
      }
    },
    {
      name: 'businessTypeField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessTypeDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        if ( this.viewData.user.businessTypeId || this.viewData.user.businessTypeId == 0) {
          if ( this.viewData.user.businessTypeId == 0 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionSole;
          }

          if ( this.viewData.user.businessTypeId == 1 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionPart;
          }

          if ( this.viewData.user.businessTypeId == 3 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionCorp;
          }

          if ( this.viewData.user.businessTypeId == 5 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionNonP;
          }
          return this.viewData.user.businessTypeId;
        } else {
          return 0;
        }
      },
      postSet: function(oldValue, newValue) {
        if ( newValue !== 'Please select' ) {
          this.viewData.user.businessTypeId = newValue;
          if ( newValue == 0 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionSole;
          }

          if ( newValue == 1 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionPart;
          }

          if ( newValue == 3 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionCorp;
          }

          if ( newValue == 5 ) {
            this.businessTypeInfo = this.BusinessTypeDescriptionNonP;
          }
          return newValue;
        } else {
          this.viewData.user.businessType = null;
          this.businessTypeInfo = '';
          return newValue;
        }
      }
    },
    {
      class: 'String',
      name: 'businessTypeInfo'
    },
    {
      class: 'String',
      name: 'businessRegistrationNumberField',
      factory: function() {
        if ( this.viewData.user.businessRegistrationNumber ) return this.viewData.user.businessRegistrationNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.businessRegistrationNumber = newValue.trim();
      }
    },
    {
      class: 'String',
      name: 'registrationAuthorityField',
      factory: function() {
        if ( this.viewData.user.businessRegistrationAuthority ) return this.viewData.user.businessRegistrationAuthority;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.businessRegistrationAuthority = newValue.trim();
      }
    },
    {
      class: 'Date',
      name: 'registrationDateField',
      factory: function() {
        if ( this.viewData.user.businessRegistrationDate ) return this.viewData.user.businessRegistrationDate;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.businessRegistrationDate = newValue;
      },
      tableCellFormatter: function(date) {
        this.add(date ? date.toLocaleDateString(foam.locale) : '');
      }
    },
    {
      name: 'countryField',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        })
      },
      factory: function() {
        if ( this.viewData.user.address.countryId ) return this.viewData.user.address.countryId;
        return 'CA';
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.countryId = newValue;
      }
    },
    {
      class: 'String',
      name: 'streetNumberField',
      factory: function() {
        if ( this.viewData.user.address.streetNumber ) return this.viewData.user.address.streetNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.streetNumber = newValue.trim();
      }
    },
    {
      class: 'String',
      name: 'streetNameField',
      factory: function() {
        if ( this.viewData.user.address.streetName ) return this.viewData.user.address.streetName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.streetName = newValue.trim();
      }
    },
    {
      class: 'String',
      name: 'suiteField',
      factory: function() {
        if ( this.viewData.user.address.suite ) return this.viewData.user.address.suite;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.suite = newValue.trim();
      }
    },
    {
      name: 'provinceField',
      view: function(_, X) {
        var choices = X.data.slot(function (countryField) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, countryField || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
      },
      factory: function() {
        if ( this.viewData.user.address.regionId ) return this.viewData.user.address.regionId;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.regionId = newValue;
      }
    },
    {
      class: 'String',
      name: 'cityField',
      factory: function() {
        if ( this.viewData.user.address.city ) return this.viewData.user.address.city;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.city = newValue;
      }
    },
    {
      class: 'String',
      name: 'postalCodeField',
      factory: function() {
        if ( this.viewData.user.address.postalCode ) return this.viewData.user.address.postalCode;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.address.postalCode = newValue;
      }
    },
    {
      name: 'businessProfilePicture',
      factory: function() {
        if ( this.viewData.user.businessProfilePicture ) return this.viewData.user.businessProfilePicture;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.businessProfilePicture = newValue;
      }
    }

  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      var businessTypeInfoSlot = this.businessTypeField$.map(function(value) { return value !== 'Please select' && value !== '' ? true : false; });
      this.scrollToTop();

      this
        .addClass(this.myClass())
        .start('div').addClass('widthWrapper')
          .start('p').add(this.BusinessInformationSubtitle).addClass('sectionTitle').end()
          .start('p').add(this.BusinessNameLabel).addClass('fieldLabel').end()
          .start(this.BUSINESS_NAME_FIELD).addClass('fullWidthField').end()

          .start('div')
            .style({ 'margin-top': '20px' })
            .addClass('animationContainer')
            .addClass('fullWidthField')
            .start('div')
              .addClass('displayContainer')
              .addClass('fullWidthField')
              .enableClass('hidden', this.isEditingPhone$)
              .start('p').add(this.BusinessPhoneLabel).addClass('fieldLabel').end()
              .start(this.DISPLAYED_PHONE_NUMBER, { placeholder: "format: 000-000-0000" })
                .addClass('fullWidthField')
                .addClass('displayOnly')
                .on('focus', function() {
                  this.blur();
                  self.phoneNumberFieldElement && self.phoneNumberFieldElement.focus();
                  self.isEditingPhone = true;
                })
              .end()
            .end()
            .start('div')
              .addClass('inputContainer')
              .addClass('fullWidthField')
              .enableClass('hidden', this.isEditingPhone$, true)
              .start('div')
                .addClass('phoneNumberFieldsCol')
                .addClass('phoneCountryCodeCol')
                .enableClass('out', this.isEditingPhone$, true)
                .start('div').add(this.CountryCodeLabel).addClass('fieldLabel').end()
                .start(this.PHONE_COUNTRY_CODE_FIELD, { mode: foam.u2.DisplayMode.DISABLED })
                  .addClass('fullWidthField')
                  .on('focus', function() {
                    this.blur();
                    self.phoneNumberFieldElement && self.phoneNumberFieldElement.focus();
                  })
                .end()
              .end()
              .start('div')
                .addClass('phoneNumberFieldsCol')
                .addClass('phoneNumberCol')
                .enableClass('out', this.isEditingPhone$, true)
                .start('p').add(this.PhoneNumberLabel).addClass('fieldLabel').end()
                .start(this.PHONE_NUMBER_FIELD, { placeholder: 'format: 000-000-0000' }, this.phoneNumberFieldElement$)
                  .addClass('fullWidthField')
                  .on('focus', function() {
                    self.isEditingPhone = true;
                  })
                  .on('focusout', function() {
                    self.isEditingPhone = false;
                  })
                .end()
              .end()
            .end()
          .end()

          .start('p').add(this.WebsiteLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.WEBSITE_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.BusinessTypeLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start('div').addClass('fullWidthField')
            .tag(this.BUSINESS_TYPE_FIELD)
            .start('div').addClass('caret').end()
          .end()

          .start('div')
            .addClass('fullWidthField')
            .addClass('businessTypeInfoContainer')
            .enableClass('hidden', businessTypeInfoSlot, true)
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-warning.svg'}).addClass('icon').end()
            .start('p').add(this.businessTypeInfo$).addClass('businessTypeInfo').end()
          .end()

          .start('p').add(this.BusinessRegistrationNumberLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.BUSINESS_REGISTRATION_NUMBER_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.RegistrationAuthorityLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.REGISTRATION_AUTHORITY_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.RegistrationDateLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.REGISTRATION_DATE_FIELD, { placeholder: 'yyyy-mm-dd'}).addClass('fullWidthField').end()

          .start('p').add(this.BusinessAddressLabel).addClass('sectionTitle').end()
          .start('p').add(this.CountryLabel).addClass('fieldLabel').end()
          .start('div').addClass('fullWidthField')
            .start(this.COUNTRY_FIELD).end()
            .start('div').addClass('caret').end()
          .end()
          .start('div').addClass('fullWidthField')
            .start('div').addClass('streetFieldCol')
              .start('p').add(this.StreetNumberLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
              .start(this.STREET_NUMBER_FIELD).addClass('streetNumberField').end()
            .end()
            .start('div').addClass('streetFieldCol')
              .start('p').add(this.StreetNameLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
              .start(this.STREET_NAME_FIELD).addClass('streetNameField').end()
            .end()
          .end()
          .start('p').add(this.Address2Label).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.SUITE_FIELD).addClass('fullWidthField').end()
          .start('p').add(this.Address2Hint).addClass('address2Hint').end()
          .start('p').add(this.ProvinceLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start('div').addClass('dropdownContainer')
            .start(this.PROVINCE_FIELD).end()
            .start('div').addClass('caret').end()
          .end()
          .start('p').add(this.CityLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.CITY_FIELD).addClass('fullWidthField').end()
          .start('p').add(this.PostalCodeLabel).addClass('fieldVerticalSpacer').addClass('fieldLabel').end()
          .start(this.POSTAL_CODE_FIELD).addClass('fullWidthField').end()

          .start('p').add(this.BusinessProfilePictureSubtitle).addClass('sectionTitle').end()
          .start('div')
            .start({
              class: 'foam.nanos.auth.ProfilePictureView',
              ProfilePictureImage$: self.businessProfilePicture$,
              placeholderImage: 'images/business-placeholder.png'
            }).end()
        .end()
      .end();
    }
  ]
});
