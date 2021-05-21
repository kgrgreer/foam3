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

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.nanos.auth.Region'
  ],

  css:`
    ^ .labelTitle {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .businessImage {
      width: 80px;
      height: 80px;
      margin-top: 10px;
      display: inline-block;
    }
    ^ .foam-u2-tag-Select {
      width: 218px;
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
    ^ .topMargin {
      margin-top: 20px;
    }
    ^ .bottomMargin {
      margin-bottom: 20px;
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
      class: 'foam.nanos.fs.FileProperty',
      name: 'profilePicture',
      view: { class: 'foam.nanos.auth.ProfilePictureView', placeholderImage: 'images/business-placeholder.png' },
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
      name: 'issuingAuthority',
      factory: function() {
        return this.viewData.issuingAuthority;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.issuingAuthority = newValue;
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
        var choices = X.data.slot(function (country) {
          return X.regionDAO.where(X.data.EQ(X.data.Region.COUNTRY_ID, country || ""));
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices
        });
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
    { name: 'BusinessNameLabel', message: 'Business Name *' },
    { name: 'CountryLabel', message: 'Country *' },
    { name: 'CompanyEmailLabel', message: 'Business Email *' },
    { name: 'RegistrationNoLabel', message: 'Registration No. *' },
    { name: 'IssueAuthorityLabel', message: 'Issuing Authority '},
    { name: 'CompanyTypeLabel', message: 'Business Type *' },
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
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
          .start().addClass('infoContainer')
            .start().add(this.BusinessInformationLabel).addClass('labelTitle').end()
            .start().addClass('topMargin').addClass('bottomMargin')
              .add(this.PROFILE_PICTURE)
            .end()
            .start().addClass('inline')
              .start().add(this.BusinessNameLabel).addClass('infoLabel').end()
              .start(this.BUSINESS_NAME).addClass('inputLarge').end()
            .end()
            // .start().addClass('inline').addClass('float-right')
            //   .start().add(this.CompanyEmailLabel).addClass('infoLabel').end()
            //   .start(this.COMPANY_EMAIL).addClass('inputLarge').end()
            // .end()
            .start().addClass('inline').addClass('margin-left')
              .start().add(this.RegistrationNoLabel).addClass('infoLabel').addClass('topMargin').end()
              .start(this.REGISTRATION_NUMBER).addClass('inputLarge').end()
            .end()
            .start().addClass('inline')
              .start().add(this.CompanyTypeLabel).addClass('infoLabel').end()
              .tag(this.BUSINESS_TYPE)
              .start().addClass('caret').end()
            .end()
            .start().addClass('inline').addClass('topMargin').addClass('margin-left')
              .start().add(this.BusinessSectorLabel).addClass('infoLabel').addClass('topMargin').end()
              .tag(this.BUSINESS_SECTOR)
              .start().addClass('caret').end()
            .end()
            .start().add(this.HomeAddressLabel).addClass('labelTitle').addClass('topMargin').end()
            .start().addClass('float-right')
              .start().add(this.WebsiteLabel).addClass('infoLabel').end()
              .start(this.WEBSITE).addClass('inputLarge').end()
            .end()
            .start().addClass('topMargin')
              .start().add(this.IssueAuthorityLabel).addClass('infoLabel').end()
              .start(this.ISSUING_AUTHORITY).addClass('inputLarge').end()
            .end()
            .start().add(this.BusinessAddressLabel).addClass('labelTitle').addClass('topMargin').end()
            .start().addClass('inline').addClass('topMargin').addClass('rightMargin')
              .start().add(this.StNoLabel).addClass('infoLabel').end()
              .start(this.STREET_NUMBER).addClass('inputSmall').end()
            .end()
            .start().addClass('inline')
              .start().add(this.StNameLabel).addClass('infoLabel').end()
              .start(this.STREET_NAME).addClass('inputMedium').end()
            .end()
            .start().addClass('inline').addClass('topMargin').addClass('float-right')
              .start().add(this.AddressLineLabel).addClass('infoLabel').end()
              .start(this.ADDRESS_LINE).addClass('inputLarge').end()
            .end()
            .start().addClass('inline').addClass('topMargin')
              .start().add(this.CityLabel).addClass('infoLabel').end()
              .start(this.CITY).addClass('inputLarge').end()
            .end()
            .start().addClass('inline').addClass('float-right').addClass('topMargin')
              .start().addClass('provinceContainer')
                .start().add(this.ProvinceLabel).addClass('infoLabel').end()
                .tag(this.PROVINCE)
                .start().addClass('caret').end()
              .end()
            .end()
            .start().addClass('topMargin').addClass('float-right')
              .start().add(this.PostalCodeLabel).addClass('infoLabel').end()
              .start(this.POSTAL_CODE).addClass('inputLarge').end()
            .end()
            .start().addClass('inline').addClass('topMargin')
              .start().add(this.CountryLabel).addClass('infoLabel').end()
              .tag(this.COUNTRY)
            .start().addClass('caret').end()
          .end()
          .end()
        .end();
    }
  ]
});
