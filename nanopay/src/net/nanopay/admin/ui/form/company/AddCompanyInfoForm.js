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
  name: 'AddCompanyInfoForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to input Admin information',

  imports: [
    'viewData',
    'goBack',
    'goNext'
  ],

  css:`
    ^ .labelTitle {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 20px;
    }
    ^ .topMargin {
      margin-top: 20px;
    }
    ^ .rightMargin {
      margin-right: 10px;
    }
    ^ .infoContainer{
      height: 330px;
    }
    ^ .full-width-input-1{
      width: 555px;
      left: -30px;
      position: relative;
      font-size: 14px;
    }
    ^ .full-width-input-password {
      /* Required for password input field */
      width: 90%;
      height: 40px;
      margin-left: 5%;
      margin-bottom: 15px;
      outline: none;
      padding: 10px;
    }
    ^ .inputLarge{
      margin-bottom: 20px;
      font-size: 14px;
    }
    ^ .position-label{
      margin-bottom: 10px;
      position: relative;
      left: 30px;
    }
    ^ .margin-left{
      margin-left: 60px;
    }
  `,

  messages: [
    { name: 'Step', message: 'Step 1: Fill in Admin\'s information and create account password.' },
    { name: 'FirstNameLabel', message: 'First Name *' },
    { name: 'LastNameLabel', message: 'Last Name *' },
    { name: 'JobTitleLabel', message: 'Job Title *' },
    { name: 'PhoneNumberLabel', message: 'Phone Number *' },
    { name: 'EmailLabel', message: 'Email *' },
    { name: 'PasswordLabel', message: 'Password *' },
    { name: 'ConfirmPasswordLabel', message: 'Confirm Password *' }
  ],

  properties: [
    {
      class: 'String',
      name: 'firstName',
      factory: function() {
        return this.viewData.firstName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.firstName = newValue;
      }
    },
    {
      class: 'String',
      name: 'lastName',
      factory: function() {
        return this.viewData.lastName;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.lastName = newValue;
      }
    },
    {
      class: 'String',
      name: 'phoneNumber',
      factory: function() {
        return this.viewData.phoneNumber;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.phoneNumber = newValue;
      }
    },
    {
      class: 'String',
      name: 'jobTitle',
      factory: function() {
        return this.viewData.jobTitle;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.jobTitle = newValue;
      }
    },
    {
      class: 'String',
      name: 'email',
      factory: function() {
        return this.viewData.email;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.email = newValue;
      }
    },
    {
      class: 'Password',
      name: 'password',
      factory: function() {
        return this.viewData.password;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.password = newValue;
      }
    },
    {
      class: 'String',
      name: 'confirmPassword',
      factory: function() {
        return this.viewData.confirmPassword;
      },
      postSet: function(oldValue, newValue) {
        this.viewData.confirmPassword = newValue;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .addClass(this.myClass())
        .start()
          .start('p').addClass('pDefault').addClass('stepTopMargin').add(this.Step).end()
          .start().addClass('infoContainer')
            .start().addClass('inline')
              .start().add(this.FirstNameLabel).addClass('infoLabel').end()
              .start(this.FIRST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline').addClass('float-right')
              .start().add(this.LastNameLabel).addClass('infoLabel').end()
              .start(this.LAST_NAME).addClass('inputLarge').end()
            .end()
            .start().addClass('inline')
              .start().add(this.JobTitleLabel).addClass('infoLabel').end()
              .start(this.JOB_TITLE).addClass('inputLarge').end()
            .end()
            .start().addClass('inline').addClass('float-right')
              .start().add(this.EmailLabel).addClass('infoLabel').end()
              .start(this.EMAIL).addClass('inputLarge').end()
            .end()
            .start().addClass('full-width-input-1')
              .start().add(this.PhoneNumberLabel).addClass('infoLabel').addClass('position-label').end()
              .start(this.PHONE_NUMBER).addClass('full-width-input').end()
            .end()
            .start().addClass('full-width-input-1')
              .start().add(this.PasswordLabel).addClass('infoLabel').addClass('position-label').end()
              .start(this.PASSWORD).end()
            .end()
            .start()
              .start().add(this.ConfirmPasswordLabel).addClass('infoLabel').end()
              .start(this.CONFIRM_PASSWORD).addClass('inputExtraLarge').end()
            .end()
          .end()
        .end();
    }
  ]
});