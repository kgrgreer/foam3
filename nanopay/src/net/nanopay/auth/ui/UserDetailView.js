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
  package: 'net.nanopay.auth.ui',
  name: 'UserDetailView',
  extends: 'foam.u2.Controller',

  requires: [
    'foam.log.LogLevel'
  ],

  imports: [
    'notify',
    'regionDAO',
    'userDAO',
    'validateAddress',
    'validateCity',
    'validateEmail',
    'validatePassword',
    'validatePhone',
    'validatePostalCode',
    'validateStreetNumber',
    'validateTitleNumOrAuth'
  ],

  css: `
    ^ .labelTitle {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-tag-Select {
      width: 218px;
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
    ^ .rightMargin {
      margin-right: 10px;
    }
    ^ .userInfoContainer {
      height: auto;
      width: 536px;
      display: block;
      margin: auto;
    }
    ^ .infoContainer {
      height: auto;
      display: block;
      vertical-align: middle;
      margin: auto;
      overflow: hidden;
    }
    ^ .light-roboto-h2 {
      margin-bottom: 15px;
      margin-top: 15px;
    }
    ^ .white-blue-button {
      margin: 20px 0px 20px 0px;
    }
    ^ .blue-button {
      margin: 20px 0px 20px 0px;
    }
  `,

  properties: [
    'user',
    'key',
    {
      class: 'String',
      name: 'firstName',
      factory: function() {
        if ( this.user.firstName ) return this.user.firstName;
      }
    },
    {
      class: 'String',
      name: 'lastName',
      factory: function() {
        if ( this.user.lastName ) return this.user.lastName;
      },
    },
    {
      class: 'String',
      name: 'email',
      factory: function() {
        if ( this.user.email ) return this.user.email;
      }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      factory: function() {
        if ( this.user.phoneNumber ) return this.user.phoneNumber;
      }
    },
    {
      class: 'Date',
      name: 'birthday',
      factory: function() {
        if ( this.user.birthday ) return this.user.birthday;
      }
    },
    {
      class: 'String',
      name: 'streetNumber',
      factory: function() {
        if ( this.user.address.streetNumber ) {
          return this.user.address.streetNumber;
        }
      }
    },
    {
      class: 'String',
      name: 'streetName',
      factory: function() {
        if ( this.user.address.streetName ) return this.user.address.streetName;
      }
    },
    {
      class: 'String',
      name: 'addressLine',
      factory: function() {
        if ( this.user.address.address2 ) return this.user.address.address2;
      }
    },
    {
      class: 'String',
      name: 'city',
      factory: function() {
        if ( this.user.address.city ) return this.user.address.city;
      }
    },
    {
      name: 'province',
      view: function(_, X) {
        var expr = foam.mlang.Expressions.create();
        var choices = X.data.slot(function(country) {
          return X.regionDAO.where(
              expr.EQ(foam.nanos.auth.Region.COUNTRY_ID, country || '')
          );
        });
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(region) {
            return [region.id, region.name];
          },
          dao$: choices,
          placeholder: 'Select Province',
          defaultValue: 'Select Province'
        });
      },
      factory: function() {
        if ( this.user.address.regionId ) return this.user.address.regionId;
      },
      postSet: function(oldValue, newValue) {
        this.user.address.regionId = newValue;
      }
    },
    {
      name: 'country',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          },
          placeholder: 'Select Country',
          defaultValue: 'Select Country'
        });
      },
      factory: function() {
        if ( this.user.address.countryId ) {
          return this.user.address.countryId;
        }
      },
      postSet: function(oldValue, newValue) {
        this.user.address.countryId = newValue;
      }
    },
    {
      class: 'String',
      name: 'postalCode',
      factory: function() {
        if ( this.user.address.postalCode ) return this.user.address.postalCode;
      }
    },
    {
      class: 'Password',
      name: 'password',
    },
    {
      class: 'Password',
      name: 'confirmPassword',
    },
    {
      name: 'group',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.groupDAO,
          objToChoice: function(a) {
            return [a.id, a.id];
          }
        });
      },
      factory: function() {
        if ( this.user.group ) return this.user.group;
      }
    },
    {
      class: 'String',
      name: 'organization',
      factory: function() {
        if ( this.user.organization ) return this.user.organization;
      }
    },
    {
      class: 'String',
      name: 'department',
      factory: function() {
        if ( this.user.department ) return this.user.department;
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      factory: function() {
        if ( this.user.jobTitle ) return this.user.jobTitle;
      }
    }
  ],

  messages: [
    { name: 'UpdateUserInfoLabel', message: 'Update User Info' },
    { name: 'PersonalInformationLabel', message: 'Personal Information' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'EmailLabel', message: 'Email *' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' },
    { name: 'BirthdayLabel', message: 'Birthday' },
    { name: 'HomeAddressLabel', message: 'Home Address' },
    { name: 'StNoLabel', message: 'St No.' },
    { name: 'StNameLabel', message: 'St Name' },
    { name: 'AddressLineLabel', message: 'Address Line' },
    { name: 'CityLabel', message: 'City' },
    { name: 'ProvinceLabel', message: 'Province' },
    { name: 'CountryLabel', message: 'Country' },
    { name: 'PostalCodeLabel', message: 'Postal Code' },
    { name: 'PasswordLabel', message: 'Password' },
    { name: 'NewPasswordLabel', message: 'New Password' },
    { name: 'ConfirmPasswordLabel', message: 'Confirm Password' },
    { name: 'GroupLabel', message: 'Group *' },
    { name: 'OrganizationLabel', message: 'Organization' },
    { name: 'DepartmentLabel', message: 'Department' },
    { name: 'JobTitleLabel', message: 'Job Title' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      if ( ! this.user ) {
        this.userDAO.find(this.key).then((u) => {
          this.user = u;
          this
            .addClass(this.myClass())
            .start()
              .start().addClass('userInfoContainer')
                .start().addClass('light-roboto-h2')
                  .add(this.UpdateUserInfoLabel)
                .end()
                .start().addClass('infoContainer')
                  .start().addClass('labelTitle')
                    .add(this.PersonalInformationLabel)
                  .end()
                  .start().addClass('topMargin').addClass('inline')
                    .start()
                      .add(this.FirstNameLabel).addClass('infoLabel')
                    .end()
                    .start(this.FIRST_NAME).addClass('inputLarge').end()
                  .end()
                  .start()
                    .addClass('topMargin').addClass('inline')
                    .addClass('float-right')
                    .start().add(this.LastNameLabel).addClass('infoLabel').end()
                    .start(this.LAST_NAME).addClass('inputLarge').end()
                  .end()
                  .start().addClass('inline').addClass('topMargin')
                    .start().add(this.EmailLabel).addClass('infoLabel').end()
                    .start(this.EMAIL).addClass('inputLarge').end()
                  .end()
                  .start()
                    .addClass('inline').addClass('float-right')
                    .addClass('topMargin')
                    .start()
                      .add(this.PhoneNumberLabel).addClass('infoLabel')
                    .end()
                    .start(this.PHONE_NUMBER).addClass('inputLarge').end()
                  .end()
                  .start().addClass('topMargin')
                    .start().add(this.BirthdayLabel).addClass('infoLabel').end()
                    .start(this.BIRTHDAY).addClass('inputLarge').end()
                  .end()
                  .start().addClass('labelTitle').addClass('topMargin')
                    .add(this.HomeAddressLabel)
                  .end()
                  .start().addClass('inline').addClass('rightMargin')
                    .start().add(this.StNoLabel).addClass('infoLabel').end()
                    .start(this.STREET_NUMBER).addClass('inputSmall').end()
                  .end()
                  .start().addClass('inline').addClass('topMargin')
                    .start().add(this.StNameLabel).addClass('infoLabel').end()
                    .start(this.STREET_NAME).addClass('inputMedium').end()
                  .end()
                  .start()
                    .addClass('inline').addClass('topMargin')
                    .addClass('float-right')
                    .start()
                      .add(this.AddressLineLabel).addClass('infoLabel')
                    .end()
                    .start(this.ADDRESS_LINE).addClass('inputLarge').end()
                  .end()
                  .start().addClass('inline').addClass('topMargin')
                    .start().add(this.CityLabel).addClass('infoLabel').end()
                    .start(this.CITY).addClass('inputLarge').end()
                  .end()
                  .start()
                    .addClass('inline').addClass('float-right')
                    .addClass('topMargin')
                    .start().addClass('provinceContainer')
                      .start()
                        .add(this.ProvinceLabel).addClass('infoLabel')
                      .end()
                      .tag(this.PROVINCE)
                      .start().addClass('caret').end()
                    .end()
                  .end()
                  .start().addClass('inline').addClass('topMargin')
                    .start()
                      .start()
                        .add(this.CountryLabel)
                          .addClass('infoLabel')
                        .end()
                        .tag(this.COUNTRY)
                      .start().addClass('caret').end()
                    .end()
                  .end()
                  .start()
                    .addClass('inline').addClass('topMargin')
                    .addClass('float-right')
                    .start()
                      .add(this.PostalCodeLabel).addClass('infoLabel')
                    .end()
                    .start(this.POSTAL_CODE).addClass('inputLarge').end()
                  .end()
                  .start().addClass('labelTitle').addClass('topMargin')
                    .add(this.PasswordLabel)
                  .end()
                  .start().addClass('topMargin')
                    .start().addClass('infoLabel')
                      .add(this.NewPasswordLabel)
                    .end()
                    .start(this.PASSWORD).addClass('inputExtraLarge').end()
                  .end()
                  .start().addClass('topMargin')
                    .start().addClass('infoLabel')
                      .add(this.ConfirmPasswordLabel)
                    .end()
                    .start(this.CONFIRM_PASSWORD)
                      .addClass('inputExtraLarge')
                    .end()
                  .end()
                  .start().addClass('inline').addClass('topMargin')
                    .start()
                      .start().add(this.GroupLabel).addClass('infoLabel').end()
                      .tag(this.GROUP)
                      .start().addClass('caret').end()
                    .end()
                  .end()
                  .start()
                    .addClass('inline').addClass('topMargin')
                    .addClass('float-right')
                    .start()
                      .add(this.OrganizationLabel).addClass('infoLabel')
                    .end()
                    .start(this.ORGANIZATION).addClass('inputLarge').end()
                  .end()
                  .start().addClass('inline').addClass('topMargin')
                    .start()
                      .add(this.DepartmentLabel).addClass('infoLabel')
                    .end()
                    .start(this.DEPARTMENT).addClass('inputLarge').end()
                  .end()
                  .start()
                    .addClass('inline').addClass('topMargin')
                    .addClass('float-right')
                    .start().add(this.JobTitleLabel).addClass('infoLabel').end()
                    .start(this.JOB_TITLE).addClass('inputLarge').end()
                  .end()
                .end()
                .start(this.BACK_ACTION).addClass('white-blue-button').end()
                .start(this.UPDATE)
                  .addClass('float-right').addClass('blue-button')
                .end()
              .end()
            .end();
        });
      } else {
        this
          .addClass(this.myClass())
          .start()
            .start().addClass('userInfoContainer')
              .start().addClass('light-roboto-h2')
                .add(this.UpdateUserInfoLabel)
              .end()
              .start().addClass('infoContainer')
                .start().addClass('labelTitle')
                  .add(this.PersonalInformationLabel)
                .end()
                .start().addClass('topMargin').addClass('inline')
                  .start().add(this.FirstNameLabel).addClass('infoLabel').end()
                  .start(this.FIRST_NAME).addClass('inputLarge').end()
                .end()
                .start()
                  .addClass('topMargin').addClass('inline')
                  .addClass('float-right')
                  .start().add(this.LastNameLabel).addClass('infoLabel').end()
                  .start(this.LAST_NAME).addClass('inputLarge').end()
                .end()
                .start().addClass('inline').addClass('topMargin')
                  .start().add(this.EmailLabel).addClass('infoLabel').end()
                  .start(this.EMAIL).addClass('inputLarge').end()
                .end()
                .start()
                  .addClass('inline').addClass('float-right')
                  .addClass('topMargin')
                  .start()
                    .add(this.PhoneNumberLabel).addClass('infoLabel')
                  .end()
                  .start(this.PHONE_NUMBER).addClass('inputLarge').end()
                .end()
                .start().addClass('topMargin')
                  .start().add(this.BirthdayLabel).addClass('infoLabel').end()
                  .start(this.BIRTHDAY).addClass('inputLarge').end()
                .end()
                .start().addClass('labelTitle').addClass('topMargin')
                  .add(this.HomeAddressLabel)
                .end()
                .start().addClass('inline').addClass('rightMargin')
                  .start().add(this.StNoLabel).addClass('infoLabel').end()
                  .start(this.STREET_NUMBER).addClass('inputSmall').end()
                .end()
                .start().addClass('inline').addClass('topMargin')
                  .start().add(this.StNameLabel).addClass('infoLabel').end()
                  .start(this.STREET_NAME).addClass('inputMedium').end()
                .end()
                .start()
                  .addClass('inline').addClass('topMargin')
                  .addClass('float-right')
                  .start()
                    .add(this.AddressLineLabel).addClass('infoLabel')
                  .end()
                  .start(this.ADDRESS_LINE).addClass('inputLarge').end()
                .end()
                .start().addClass('inline').addClass('topMargin')
                  .start().add(this.CityLabel).addClass('infoLabel').end()
                  .start(this.CITY).addClass('inputLarge').end()
                .end()
                .start()
                  .addClass('inline').addClass('float-right')
                  .addClass('topMargin')
                  .start().addClass('provinceContainer')
                    .start().add(this.ProvinceLabel).addClass('infoLabel').end()
                    .tag(this.PROVINCE)
                    .start().addClass('caret').end()
                  .end()
                .end()
                .start().addClass('inline').addClass('topMargin')
                  .start()
                    .start().add(this.CountryLabel).addClass('infoLabel').end()
                      .tag(this.COUNTRY)
                    .start().addClass('caret').end()
                  .end()
                .end()
                .start()
                  .addClass('inline').addClass('topMargin')
                  .addClass('float-right')
                  .start().add(this.PostalCodeLabel).addClass('infoLabel').end()
                  .start(this.POSTAL_CODE).addClass('inputLarge').end()
                .end()
                .start().addClass('labelTitle').addClass('topMargin')
                  .add(this.PasswordLabel)
                .end()
                .start().addClass('topMargin')
                  .start().addClass('infoLabel')
                    .add(this.NewPasswordLabel)
                  .end()
                  .start(this.PASSWORD).addClass('inputExtraLarge').end()
                .end()
                .start().addClass('topMargin')
                  .start().addClass('infoLabel')
                    .add(this.ConfirmPasswordLabel)
                  .end()
                  .start(this.CONFIRM_PASSWORD)
                    .addClass('inputExtraLarge')
                  .end()
                .end()
                .start().addClass('inline').addClass('topMargin')
                  .start()
                    .start().add(this.GroupLabel).addClass('infoLabel').end()
                    .tag(this.GROUP)
                    .start().addClass('caret').end()
                  .end()
                .end()
                .start()
                  .addClass('inline').addClass('topMargin')
                  .addClass('float-right')
                  .start()
                    .add(this.OrganizationLabel).addClass('infoLabel')
                  .end()
                  .start(this.ORGANIZATION).addClass('inputLarge').end()
                .end()
                .start().addClass('inline').addClass('topMargin')
                  .start().add(this.DepartmentLabel).addClass('infoLabel').end()
                  .start(this.DEPARTMENT).addClass('inputLarge').end()
                .end()
                .start()
                  .addClass('inline').addClass('topMargin')
                  .addClass('float-right')
                  .start().add(this.JobTitleLabel).addClass('infoLabel').end()
                  .start(this.JOB_TITLE).addClass('inputLarge').end()
                .end()
              .end()
              .start(this.BACK_ACTION).addClass('white-blue-button').end()
              .start(this.UPDATE)
                .addClass('float-right').addClass('blue-button')
              .end()
            .end()
          .end();
      }
    },

    function validations() {
      if ( this.firstName.length > 70 ) {
        this.showErrorMessage('First name cannot exceed 70 characters.');
        return false;
      }
      if ( /\d/.test(this.firstName) ) {
        this.showErrorMessage('First name cannot contain numbers');
        return false;
      }
      if ( this.lastName.length > 70 ) {
        this.showErrorMessage('Last name cannot exceed 70 characters.');
        return false;
      }
      if ( /\d/.test(this.lastName) ) {
        this.showErrorMessage('Last name cannot contain numbers.');
        return false;
      }
      if ( ! this.email ) {
        this.showErrorMessage('Email required.');
        return false;
      } else {
        if ( ! this.validateEmail(this.email) ) {
          this.showErrorMessage('Invalid email address.');
          return false;
        }
      }
      if ( this.password && this.confirmPassword ) {
        if ( ! this.validatePassword(this.password) ) {
          this.showErrorMessage('Password must be at least 6 characters long.');
          return false;
        }
        if ( this.password !== this.confirmPassword ) {
          this.showErrorMessage('Password does not match.');
          return false;
        }
      }
      if ( this.phoneNumber ) {
        if ( ! this.validatePhone(this.phoneNumber) ) {
          this.showErrorMessage('Invalid phone number.');
          return false;
        }
      }
      if ( this.streetName ) {
        if ( ! this.validateAddress(this.streetName) ) {
          this.showErrorMessage('Invalid street name.');
          return false;
        }
      }
      if ( this.streetNumber ) {
        if ( ! this.validateStreetNumber(this.streetNumber) ) {
          this.showErrorMessage('Invalid street number.');
          return false;
        }
      }
      if ( this.city ) {
        if ( ! this.validateCity(this.city) ) {
          this.showErrorMessage('Invalid city name.');
          return false;
        }
      }
      if ( this.postalCode ) {
        if ( ! this.validatePostalCode(this.postalCode, this.country) ) {
          this.showErrorMessage('Invalid postal code.');
          return false;
        }
      }
      if ( ! this.group ) {
        this.showErrorMessage('Group required.');
        return false;
      }
      if ( this.jobTitle ) {
        if ( ! this.validateTitleNumOrAuth(this.jobTitle) ) {
          this.showErrorMessage('Invalid job title.');
          return false;
        }
      }

      return true;
    },

    function showErrorMessage(msg) {
      this.notify(msg, '', this.LogLevel.ERROR, true);
    }
  ],

  actions: [
    {
      name: 'update',
      label: 'Update',
      code: function(X) {
        if ( this.validations() ) {
          this.user.firstName = X.data.firstName;
          this.user.lastName = X.data.lastName;
          this.user.email = X.data.email;
          this.user.group = X.data.group;

          if ( X.data.phoneNumber ) {
            this.user.phoneNumber = X.data.phoneNumber;
          }
          if ( X.data.birthday ) {
            this.user.birthday = X.data.birthday;
          }
          if ( X.data.jobTitle ) {
            this.user.jobTitle = X.data.jobTitle;
          }
          if ( X.data.streetNumber ) {
            this.user.address.streetNumber = X.data.streetNumber;
          }
          if ( X.data.streetName ) {
            this.user.address.streetName = X.data.streetName;
          }
          if ( X.data.AddressLine ) {
            this.user.address.address2 = X.data.addressLine;
          }
          if ( X.data.city ) {
            this.user.address.city = X.data.city;
          }
          if ( X.data.regionId ) {
            this.user.address.regionId = X.data.regionId;
          }
          if ( X.data.postalCode ) {
            this.user.address.postalCode = X.data.postalCode;
          }
          if ( X.data.organization ) {
            this.user.organization = X.data.organization;
          }
          if ( X.data.department ) {
            this.user.department = X.data.department;
          }
          if ( X.data.jobTitle ) {
            this.user.jobTitle = X.data.jobTitle;
          }
          if ( X.data.password && X.data.confirmPassword ) {
            this.user.desiredPassword = X.data.password;
          }

          this.userDAO.put(this.user);
          X.stack.back();
        }
      }
    },
    {
      name: 'backAction',
      label: 'Back',
      code: function(X) {
        X.stack.back();
      }
    }
  ]
});
