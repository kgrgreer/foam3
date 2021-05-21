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
  name: 'ConfirmAdminInfoForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form to input and confirm admin information',

  css: `
  ^ .container {
    width: 540px;
  }
  ^ .sectionTitle {
    line-height: 16px;
    font-size: 14px;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 20px;
  }
  ^ .nameContainer {
    position: relative;
    width: 540px;
    height: 64px;
    overflow: hidden;
    box-sizing: border-box;
  }
  ^ .description {
    font-size: 12px;
    font-weight: normal;
    font-style: normal;
    font-stretch: normal;
    line-height: 1.5;
    letter-spacing: 0.2px;
    text-align: left;
    color: /*%BLACK%*/ #1e1f21;
  }
  ^ .label {
    font-size: 14px;
    font-weight: 300;
    font-style: normal;
    font-stretch: normal;
    line-height: normal;
    letter-spacing: 0.2px;
    text-align: left;
    color: /*%BLACK%*/ #1e1f21;
    margin-left: 0;
  }
  ^ .nameDisplayContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 540px;
    height: 64px;
    opacity: 1;
    box-sizing: border-box;
    transition: all 0.15s linear;
    z-index: 10;
  }
  ^ .nameDisplayContainer.hidden {
    left: 540px;
    opacity: 0;
  }
  ^ .nameDisplayContainer p {
    margin: 0;
    margin-bottom: 8px;
  }
  ^ .legalNameDisplayField {
    width: 100%;
    height: 40px;
    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5) !important;
    padding: 12px 13px;
    box-sizing: border-box;
  }
  ^ .nameInputContainer {
    position: absolute;
    top: 0;
    left: 0;
    width: 540px;
    height: 64px;
    opacity: 1;
    box-sizing: border-box;
    z-index: 9;
  }
  ^ .nameInputContainer.hidden {
    pointer-events: none;
    opacity: 0;
  }
  ^ .phoneFieldsCol {
    display: inline-block;
    vertical-align: middle;
    height: 64px;
    opacity: 1;
    box-sizing: border-box;
    margin-right: 20px;
    transition: all 0.15s linear;
  }
  ^ .nameFieldsCol {
    display: inline-block;
    vertical-align: middle;
    /* 100% minus 2x 20px padding equally divided by 3 fields */
    width: calc((100% - 40px) / 3);
    height: 64px;
    opacity: 1;
    box-sizing: border-box;
    margin-right: 20px;
    transition: all 0.15s linear;
  }
  ^ .nameFieldsCol:last-child {
    margin-right: 0;
  }
  ^ .nameFieldsCol p {
    margin: 0;
    margin-bottom: 8px;
  }
  ^ .nameFieldsCol.firstName {
    opacity: 0;
    // transform: translateX(64px);//translateX(-166.66px);
  }
  ^ .nameFieldsCol.middleName {
    opacity: 0;
    transform: translateX(-166.66px);//translateX(64px);
  }
  ^ .nameFieldsCol.lastName {
    opacity: 0;
    transform: translateX(-166.66px);//translateY(64px);//translateX(166.66px);
  }
  ^ .nameFields {
    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5);
    padding: 12px 13px;
    width: 100%;
    height: 40px;
    box-sizing: border-box;
    outline: none;
  }
  ^ .largeInput {
    width: 540px;
    height: 40px;
    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5);
    padding: 12px;
    font-size: 12px;
    color: /*%BLACK%*/ #1e1f21;
    outline: none;
  }
  ^ .countryCodeInput {
    width: 105px;
    height: 40px;
    border: solid 1px rgba(164, 179, 184, 0.5);
    padding: 12px;
    font-size: 12px;
    color: /*%BLACK%*/ #1e1f21;
    outline: none;
  }
  ^ .phoneNumberInput {
    width: 415px;
    height: 40px;
    border: solid 1px rgba(164, 179, 184, 0.5);
    padding: 12px;
    font-size: 12px;
    color: /*%BLACK%*/ #1e1f21;
    outline: none;
  }
  ^ .property-emailAddress {
    margin-bottom: 10px;
  }

  ^ .foam-u2-TextField:disabled {
    border: solid 1px rgba(164, 179, 184, 0.5) !important;
    color: #a4b3b8 !important;
  }
  ^ .foam-u2-TextField {
    height: 40px;

    background-color: #ffffff;
    border: solid 1px rgba(164, 179, 184, 0.5);

    padding: 12px 13px;

    box-sizing: border-box;
    outline: none;

    -webkit-transition: all .15s linear;
    -moz-transition: all .15s linear;
    -ms-transition: all .15s linear;
    -o-transition: all .15s linear;
    transition: all 0.15s linear;
  }

  ^ .foam-u2-TextField:focus,
  ^ .foam-u2-DateView:focus,
  ^ .foam-u2-tag-Select:focus,
  ^ .foam-u2-ActionView:focus {
    border: solid 1px #59A5D5;
  }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'isEditingName',
      value: false,
      postSet: function (oldValue, newValue) {
        this.displayedLegalName = '';
        if ( this.firstNameField ) this.displayedLegalName += this.firstNameField;
        if ( this.middleNameField ) this.displayedLegalName += ' ' + this.middleNameField;
        if ( this.lastNameField ) this.displayedLegalName += ' ' + this.lastNameField;
      }
    },
    {
      class: 'Boolean',
      name: 'isEditingPhone',
      value: false,
      postSet: function (oldValue, newValue) {
        this.displayedPhoneNumber = '';
        if ( this.countryCode ) this.displayedPhoneNumber += this.countryCode;
        if ( this.phoneNumber ) this.displayedPhoneNumber += ' ' + this.phoneNumber;
      }
    },
    {
      class: 'String',
      name: 'displayedLegalName',
      factory: function() {
        if ( this.viewData.user.middleName ) {
          return this.viewData.user.firstName + ' ' + this.viewData.user.middleName + ' ' + this.viewData.user.lastName;
        }
        return this.viewData.user.firstName + ' ' + this.viewData.user.lastName;
      }
    },
    {
      class: 'String',
      name: 'firstNameField',
      factory: function() {
        return this.viewData.user.firstName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.firstName = newValue;
      }
    },
    'firstNameElement',
    {
      class: 'String',
      name: 'middleNameField',
      factory: function() {
        return this.viewData.user.middleName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.middleName = newValue;
      }
    },
    {
      class: 'String',
      name: 'lastNameField',
      factory: function() {
        return this.viewData.user.lastName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.lastName = newValue;
      }
    },
    {
      name: 'jobTitle',
      class: 'String',
      factory: function() {
        return this.viewData.user.jobTitle;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.jobTitle = newValue;
      }
    },
    {
      name: 'emailAddress',
      class: 'String',
      visibility: 'DISABLED',
      factory: function() {
        return this.viewData.user.email;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.user.email = newValue;
      }
    },
    {
      name: 'displayedPhoneNumber',
      class: 'String'
    },
    {
      name: 'countryCode',
      class: 'String',
      factory: function() {
        return '+1';
      }
    },
    {
      name: 'phoneNumber',
      class: 'String',
      factory: function() {
        return this.viewData.user.phoneNumber ? this.viewData.user.phoneNumber.substring(2) : '';
      },
      postSet: function(oldValue, newValue) {
        this.isEditingPhone = false;
        this.viewData.user.phoneNumber = '+1 ' + newValue;
      }
    },
    'phoneNumberElement'
  ],

  messages: [
    { name: 'LegalNameLabel', message: 'Legal Name' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'MiddleInitialsLabel', message: 'Middle Initials (optional)' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'JobTitleLabel', message: 'Job Title' },
    { name: 'EmailAddressLabel', message: 'Email Address' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .start('p').add('Account ID ' + this.viewData.user.id).addClass('sectionTitle').end()
            .start('div').addClass('nameContainer')
            .start('div')
              .addClass('nameDisplayContainer')
              .enableClass('hidden', this.isEditingName$)
                .start('p').add(this.LegalNameLabel).addClass('infoLabel').end()
                .start(this.DISPLAYED_LEGAL_NAME)
                  .addClass('legalNameDisplayField')
                  .on('focus', function() {
                    this.blur();
                    self.isEditingName = true;
                    self.isEditingPhone = false;
                    self.firstNameElement.focus();
                  })
                .end()
            .end()
            .start('div')
              .addClass('nameInputContainer')
              .enableClass('hidden', this.isEditingName$, true)
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('firstName', this.isEditingName$, true)
                    .start('p').add(this.FirstNameLabel).addClass('infoLabel').end()
                    .start(this.FIRST_NAME_FIELD, {}, this.firstNameElement$)
                      .addClass('nameFields')
                      .on('click', function() {
                        self.isEditingName = true;
                      })
                    .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('middleName', this.isEditingName$, true)
                    .start('p').add(this.MiddleInitialsLabel).addClass('infoLabel').end()
                    .start(this.MIDDLE_NAME_FIELD)
                      .addClass('nameFields')
                      .on('click', function() {
                        self.isEditingName = true;
                      })
                    .end()
                .end()
                .start('div')
                  .addClass('nameFieldsCol')
                  .enableClass('lastName', this.isEditingName$, true)
                    .start('p').add(this.LastNameLabel).addClass('infoLabel').end()
                    .start(this.LAST_NAME_FIELD)
                      .addClass('nameFields')
                      .on('click', function() {
                        self.isEditingName = true;
                      })
                    .end()
                .end()
            .end()
          .end()
          .start('div')
            .on('click', function() {
              self.notEditingName();
              self.notEditingPhone();
            })
            .start()
              .start('p').add(this.JobTitleLabel).addClass('label').end()
              .start(this.JOB_TITLE).addClass('largeInput')
                .on('focus', function() {
                  self.isEditingPhone = false;
                  self.isEditingName = false;
                })
              .end()
            .end()
            .start()
              .start('p').add(this.EmailAddressLabel).addClass('label').end()
              .start(this.EMAIL_ADDRESS).addClass('largeInput')
                .on('focus', function() {
                  self.isEditingPhone = false;
                  self.isEditingName = false;
                })
              .end()
            .end()
          .end()
          .start()
            .addClass('nameContainer')
            .start()
              .addClass('nameDisplayContainer')
              .enableClass('hidden', this.isEditingPhone$)
              .start('p').add(this.PhoneNumberLabel).addClass('label').end()
              .start(this.DISPLAYED_PHONE_NUMBER)
                .addClass('legalNameDisplayField')
                .on('focus', function() {
                  this.blur();
                  self.isEditingPhone = true;
                  self.isEditingName = false;
                  self.phoneNumberElement.focus();
                })
              .end()
            .end()
            .start('div')
              .addClass('nameInputContainer')
              .enableClass('hidden', this.isEditingPhone$, true)
              .start('div')
                .addClass('phoneFieldsCol')
                .enableClass('firstName', this.isEditingPhone$, true)
                .start().add(this.CountryCodeLabel).addClass('label').style({ 'margin-bottom': '8px' }).end()
                .start(this.COUNTRY_CODE, { mode: foam.u2.DisplayMode.DISABLED })
                  .addClass('countryCodeInput')
                  .on('click', function() {
                    self.isEditingPhone = true;
                  })
                .end()
              .end()
              .start('div')
                .addClass('nameFieldsCol')
                .enableClass('middleName', this.isEditingPhone$, true)
                .start('p').add(this.PhoneNumberLabel).addClass('label').end()
                .start(this.PHONE_NUMBER, { placeholder: 'format: 000-000-0000' }, this.phoneNumberElement$)
                  .addClass('phoneNumberInput')
                  .on('click', function() {
                    self.isEditingPhone = true;
                  })
                .end()
              .end()
            .end()
          .end()
        .end();
    },
    function notEditingName() {
      this.isEditingName = false;
    },
    function notEditingPhone() {
      this.isEditingPhone = false;
    }
  ]
});
