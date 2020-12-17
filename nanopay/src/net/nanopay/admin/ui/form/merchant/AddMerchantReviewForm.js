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
  package: 'net.nanopay.admin.ui.form.merchant',
  name: 'AddMerchantReviewForm',
  extends: 'foam.u2.Controller',

  documentation: 'Form to review merchant information to make sure its correct',

  imports: [
    'businessSectorDAO',
    'businessTypeDAO',
    'goBack',
    'goNext',
    'viewData',
  ],

  css:`
    ^ .greenLabel {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #2cab70;
    }
    ^ .businessImage {
      width: 53px;
      height: 53px;
      margin-top: 20px;
      display: inline-block;
    }
    ^ .businessName {
      position: relative;
      font-size: 14px;
      font-weight: 300;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
      bottom: 35;
      left: 45;
    }
    ^ .boldLabel {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
      margin-bottom: 15px;
    }
    ^ .infoText {
      width: 150px;
      font-size: 12px;
      letter-spacing: 0.3px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .rightMargin {
      margin-right: 80px;
    }
    ^ .alignTopWithMargin {
      vertical-align: top;
      margin-left: 160px;
    }
  `,

  messages: [
    { name: 'Step', message: 'Step 3: Please scroll down and review all the details of the merchant.' },
    { name: 'MerchantInfoLabel', message: 'Merchant Info' },
    { name: 'FirstNameLabel', message: 'First Name' },
    { name: 'LastNameLabel', message: 'Last Name' },
    { name: 'EmailLabel', message: 'Email' },
    { name: 'PhoneLabel', message: 'Phone' },
    { name: 'PasswordLabel', message: 'Password' },
    { name: 'BusinessProfileLabel', message: 'Business Profile' },
    { name: 'CompanyEmailLabel', message: 'Business Email' },
    { name: 'CompanyTypeLabel', message: 'Business Type' },
    { name: 'RegistrationNumberLabel', message: 'Registration Number' },
    { name: 'BusinessSectorLabel', message: 'Business Sector' },
    { name: 'WebsiteLabel', message: 'Website' },
    { name: 'AddressLabel', message: 'Address' },
    { name: 'SendMoneyLabel', message: 'Send Money' },
    { name: 'AmountLabel', message: 'Amount' }
  ],

  properties: [
    'businessTypeName',
    'businessSectorName'
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.businessTypeDAO.find(this.viewData.businessType).then(function(a) {
        self.businessTypeName = a.name;
      });

      this.businessSectorDAO.find(this.viewData.businessSector).then(function(a) {
        self.businessSectorName = a.name;
      });
      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Step).addClass('pDefault').addClass('stepTopMargin').end()
          .start().addClass('infoContainer')
            .start().add(this.MerchantInfoLabel).addClass('greenLabel').addClass('bottomMargin').end()
            .start().addClass('inline')
              .start().add(this.FirstNameLabel).addClass('boldLabel').end()
              .start().add(this.viewData.firstName).addClass('infoText').addClass('bottomMargin').end()
              .start().add(this.EmailLabel).addClass('boldLabel').end()
              .start().add(this.viewData.companyEmail).addClass('infoText').addClass('bottomMargin').end()
            .end()
            .start().addClass('inline').addClass('alignTopWithMargin')
              .start().add(this.LastNameLabel).addClass('boldLabel').end()
              .start().add(this.viewData.lastName).addClass('infoText').addClass('bottomMargin').end()
              .start().add(this.PhoneLabel).addClass('boldLabel').end()
              .start().add(this.viewData.phoneNumber).addClass('infoText').end()
            .end()
            .start().add(this.BusinessProfileLabel).addClass('greenLabel').end()
            .start().addClass('bottomMargin')
              .start().addClass('businessImage')
                .tag({
                  class: 'foam.nanos.auth.ProfilePictureView',
                  data: this.viewData.profilePicture,
                  uploadHidden: true
                })
              .end()
              .start().add(this.viewData.businessName).addClass('businessName').end()
            .end()
            .start().addClass('inline')
              .start().add(this.CompanyEmailLabel).addClass('boldLabel').end()
              .start().add(this.viewData.companyEmail).addClass('infoText').addClass('bottomMargin').end()
              .start().add(this.RegistrationNumberLabel).addClass('boldLabel').end()
              .start().add(this.viewData.registrationNumber).addClass('infoText').addClass('bottomMargin').end()
              .start().add(this.WebsiteLabel).addClass('boldLabel').end()
              .start().add(this.viewData.website).addClass('infoText').end()
            .end()
            .start().addClass('inline').addClass('alignTopWithMargin')
              .start().add(this.CompanyTypeLabel).addClass('boldLabel').end()
              .start().add(self.businessTypeName$).addClass('infoText').addClass('bottomMargin').end()
              .start().add(this.BusinessSectorLabel).addClass('boldLabel').end()
              .start().add(self.businessSectorName$).addClass('infoText').addClass('bottomMargin').end()
              .start().add(this.AddressLabel).addClass('boldLabel').end()
              .start().add(this.viewData.streetNumber + ' ' + this.viewData.streetName).addClass('infoText').end()
              .start().add(this.viewData.postalCode).addClass('infoText').end()
              .start().add(this.viewData.addressLine).addClass('infoText').end()
              .start().add(this.viewData.city + ' ' + this.viewData.province + ' ' + this.viewData.country).addClass('infoText').end()
            .end()
            .start().add(this.SendMoneyLabel).addClass('greenLabel').addClass('bottomMargin').end()
            .start().addClass('inline')
              .start().add(this.AmountLabel).addClass('boldLabel').end()
              .start().add('$',(this.viewData.amount/100).toFixed(2)).addClass('infoText').addClass('bottomMargin').end()
            .end()
          .end()
        .end();
    }
  ]
});
