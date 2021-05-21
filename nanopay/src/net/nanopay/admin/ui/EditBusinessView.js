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
  package: 'net.nanopay.admin.ui',
  name: 'EditBusinessView',
  extends: 'foam.u2.Controller',

  documentation: 'View for editing a business',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User'
  ],

  imports: [
    'stack',
    'notify',
    'userDAO',
    'validatePhone',
    'validateTitleNumOrAuth'
  ],

  css: `
    ^ {
      width: 540px;
      margin: 0 auto;
    }
    ^ .nameContainer {
      position: relative;
      width: 540px;
      height: 64px;
      overflow: hidden;
      box-sizing: border-box;
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
    ^ .marginLeft {
      margin-left: 20px;
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
    ^ .buttonDiv {
      width: 100%;
      height: 60px;
      background-color: /*%GREY5%*/ #f5f7fa;
      position: relative;
      bottom: 0;
      z-index: 200;
    }
    ^ .foam-u2-ActionView-closeButton {
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      margin-top: 30px;
    }
    ^ .foam-u2-ActionView-closeButton:hover {
      background: lightgray;
    }
    ^ .foam-u2-ActionView-saveButton {
      float: right;
      border-radius: 2px;
      background-color: /*%PRIMARY3%*/ #406dea;
      color: white;
      margin-top: 30px;
    }
    ^ .foam-u2-ActionView-saveButton:hover {
      background: /*%PRIMARY3%*/ #406dea;
      opacity: 0.9;
    }
    ^ .property-confirmEmailAddress {
      margin-bottom: 10px;
    }
    ^ .readOnly {
      color: #a4b3b8;
    }
  `,

  properties: [
    'data',
    {
      class: 'Boolean',
      name: 'isEditingName',
      value: false
    },
    {
      class: 'Boolean',
      name: 'isEditingPhone',
      value: false,
      postSet: function (oldValue, newValue) {
        this.displayedPhoneNumber = '';
        if ( this.countryCode ) this.displayedPhoneNumber += this.countryCode;
        if ( this.data.phoneNumber ) this.displayedPhoneNumber += ' ' + this.data.phoneNumber;
      }
    },
    {
      class: 'String',
      name: 'displayedPhoneNumber',
      value: '+1'
    },
    {
      class: 'String',
      name: 'countryCode',
      value: '+1'
    }
  ],

  messages: [
    { name: 'Title', message: 'Edit Business Profile' },
    { name: 'Subtitle', message: 'Account ID' },
    { name: 'LegalNameLabel', message: 'Legal Name' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'MiddleNameLabel', message: 'Middle Initials (optional)' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'JobTitleLabel', message: 'Job Title' },
    { name: 'EmailLabel', message: 'Email Address' },
    { name: 'CountryCodeLabel', message: 'Country Code' },
    { name: 'PhoneNumberLabel', message: 'Phone Number' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('h1').add(this.Title).end()
        .start('h3').add(this.Subtitle + ' ' + this.data.id).end()
        .start('div').addClass('nameContainer')
          .start('div').addClass('nameDisplayContainer')
            .enableClass('hidden', this.isEditingName$)
            .start('p').add(this.LegalNameLabel).addClass('infoLabel').end()
            .start(this.User.LEGAL_NAME, { data$: this.data.legalName$, tabIndex: 1 })
              .addClass('legalNameDisplayField')
              .on('focus', function () {
                this.blur();
                self.isEditingName = true;
                this.isEditingPhone = false;
              })
            .end()
          .end()
          .start('div').addClass('nameInputContainer')
            .enableClass('hidden', this.isEditingName$, true)
            .start('div').addClass('nameFieldsCol')
              .enableClass('firstName', this.isEditingName$, true)
              .start('p').addClass('infoLabel').add(this.FirstNameLabel).end()
              .start(this.User.FIRST_NAME, { data$: this.data.firstName$, tabIndex: 2 })
                .addClass('nameFields')
                .on('click', function () {
                  self.isEditingName = true;
                })
              .end()
            .end()
            .start('div').addClass('nameFieldsCol')
              .enableClass('middleName', this.isEditingName$, true)
              .start('p').addClass('infoLabel').add(this.MiddleNameLabel).end()
              .start(this.User.MIDDLE_NAME, { data$: this.data.middleName$, tabIndex: 3 })
                .addClass('nameFields')
                .on('click', function () {
                  self.isEditingName = true;
                })
              .end()
            .end()
            .start('div').addClass('nameFieldsCol')
              .enableClass('lastName', this.isEditingName$, true)
              .start('p').addClass('infoLabel').add(this.LastNameLabel).end()
              .start(this.User.LAST_NAME, { data$: this.data.lastName$, tabIndex: 4 })
                .addClass('nameFields')
                .on('click', function () {
                  self.isEditingName = true;
                })
              .end()
            .end()
          .end()
        .end()
        .start('div').style({ 'padding-bottom': '12px' })
          .on('click', function () {
            self.isEditingName = false;
            self.isEditingPhone = false;
          })
          .start()
            .start('p').addClass('label').add(this.JobTitleLabel).end()
            .start(this.User.JOB_TITLE, { data$: this.data.jobTitle$ })
              .addClass('largeInput')
              .on('focus', function () {
                self.isEditingName = false;
                self.isEditingPhone = false;
              })
            .end()
          .end()
          .start()
            .start('p').addClass('label').add(this.EmailLabel).end()
            .start(this.User.EMAIL, { data$: this.data.email$, mode: foam.u2.DisplayMode.RO })
              .addClass('largeInput').addClass('readOnly')
              .on('focus', function () {
                self.isEditingName = false;
                self.isEditingPhone = false;
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
            .start(this.DISPLAYED_PHONE_NUMBER, { data$: this.data.phoneNumber$})
              .addClass('legalNameDisplayField')
              .on('focus', function() {
                this.blur();
                self.isEditingName = false;
                self.isEditingPhone = true;
              })
            .end()
          .end()
          .start('div')
            .addClass('nameInputContainer')
            .enableClass('hidden', this.isEditingPhone$, true)
            .start('div')
              .addClass('phoneFieldsCol')
              .enableClass('firstName', this.isEditingPhone$, true)
              .start().add(this.CountryCodeLabel).addClass('label').end()
              .start(this.COUNTRY_CODE, { mode: foam.u2.DisplayMode.RO })
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
              .start(this.User.PHONE_NUMBER, {
                data$: this.data.phoneNumber$.map( function(a) {
                  return a.replace( self.countryCode, '' );
                })
              })
                .addClass('phoneNumberInput')
                .on('click', function() {
                  self.isEditingPhone = true;
                })
              .end()
            .end()
          .end()
        .end()
        .start().addClass('buttonDiv')
          .start(this.CLOSE_BUTTON).end()
          .start(this.SAVE_BUTTON).end()
        .end()
    },

    function validations() {
      if ( ! this.data.firstName || ! this.data.lastName || ! this.data.jobTitle || ! this.data.phoneNumber ) {
        this.notify('Please fill out all necessary fields before proceeding.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( this.data.firstName.length > 70 ) {
        this.notify('First name cannot exceed 70 characters', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( /\d/.test(this.data.firstName) ) {
        this.notify('First name cannot contain numbers.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( this.data.middleName ) {
        if ( this.data.middleName.length > 70 ) {
          this.notify('Middle initials cannoot exceed 70 characters', '', this.LogLevel.ERROR, true);
          return false;
        }
        if ( /\d/.test(this.data.middleName) ) {
          this.notify('Middle initials cannot contain numbers.', '', this.LogLevel.ERROR, true);
          return false;
        }
      }
      if ( this.data.lastName.length > 70 ) {
        this.notify('Last name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( /\d/.test(this.data.lastName) ) {
        this.notify('Last name cannot contain numbers.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateTitleNumOrAuth(this.data.jobTitle) ) {
        this.notify('Invalid job title.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePhone(this.countryCode + ' ' + this.data.phoneNumber) ) {
        this.notify('Invalid phone number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    }
  ],

  actions: [
    {
      name: 'closeButton',
      label: 'Close',
      code: function (X) {
        this.stack.back();
      }
    },
    {
      name: 'saveButton',
      label: 'Save',
      code: function (X) {
        var self = this;
        if ( ! this.validations() ) {
          return;
        }

        this.userDAO.put(this.data).then(function (result) {
          self.notify('Successfully updated business profile.', '', self.LogLevel.INFO, true);
          self.stack.back();
        })
        .catch(function (err) {
          self.notify('Error updating business profile.', '', self.LogLevel.ERROR, true);
        });
      }
    }
  ]
});
