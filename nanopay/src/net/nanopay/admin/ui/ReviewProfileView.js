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
  name: 'ReviewProfileView',
  extends: 'foam.u2.View',

  documentation: 'View that holds user profile information',

  imports: [
    'businessTypeDAO'
  ],

  css: `
    ^ .container {
      width: 540px;
      margin: 0 auto;
    }
    ^ h2 {
      height: 20px;
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .principalOwnerLabel {
      margin: 0 auto;
      margin-top: 20px;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      width: 540px;
    }
    ^ .principalOwnerContainer {
      padding-left: 25px;
      width: 540px;
      margin: 0 auto;
    }
    ^ .net-nanopay-invoice-ui-InvoiceFileView {
      min-width: 520px;
      height: 30px;
      padding-top: 10px;
    }
  `,

  messages: [
    { name: 'BoxTitle1', message: 'Previously Submitted Additional Documents' },
    { name: 'BoxTitle2', message: '1. Business Profile' },
    { name: 'BoxTitle3', message: "2. Principal Owner's Profile" },
    { name: 'BoxTitle4', message: '3. Questionnaire' },
    { name: 'CloseLabel', message: 'Close' },
    { name: 'BusiNameLabel', message: 'Registered Business Name' },
    { name: 'BusiPhoneLabel', message: 'Business Phone' },
    { name: 'BusiWebsiteLabel', message: 'Website (optional)' },
    { name: 'BusiTypeLabel', message: 'Business Type' },
    { name: 'BusiRegNumberLabel', message: 'Business Registration Number' },
    { name: 'BusiRegAuthLabel', message: 'Registration Authority'},
    { name: 'BusiRegDateLabel', message: 'Registration Date' },
    { name: 'BusiAddressLabel', message: 'Business Address' },
    { name: 'BusiLogoLabel', message: 'Business Logo (optional)' }
  ],

  properties: [
    'businessTypeName',
    'data'
  ],

  methods: [
    async function initE() {

      var self = this;
      this.businessTypeName = typeof this.data.businessTypeId === 'number'
        ? (await this.businessTypeDAO.find(this.data.businessTypeId)).name
        : 'Unrecognized Business Type';

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            // Additional Documents
            .callIf(this.data.additionalDocuments.length > 0, function () {
              this.start().addClass('wizardBoxTitleContainer')
              .start().add(self.BoxTitle1).addClass('wizardBoxTitleLabel').end()
              .end()
              .add(this.slot(function (documents) {
                if ( documents.length <= 0 ) return;
      
                var e = this.E()
                  .start('span')
                  .end();
      
                for ( var i = 0 ; i < documents.length ; i++ ) {
                  e.tag({
                    class: 'net.nanopay.invoice.ui.InvoiceFileView',
                    data: documents[i],
                    fileNumber: i + 1,
                    removeHidden: true
                  });
                }
                return e;
              }, self.data.additionalDocuments$))
            })

            // Business Profile
            .start().addClass('wizardBoxTitleContainer')
              .start().add(this.BoxTitle2).addClass('wizardBoxTitleLabel').end()
            .end()
            .start('p').add(this.BusiNameLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessName$).end()
            .start('p').add(this.BusiPhoneLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.phoneNumber$).end()
            .start('p').add(this.BusiWebsiteLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.website$).end()
            .start('p').add(this.BusiTypeLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.businessTypeName$).end()
            .start('p').add(this.BusiRegNumberLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessRegistrationNumber$).end()
            .start('p').add(this.BusiRegAuthLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessRegistrationAuthority$).end()
            .start('p').add(this.BusiRegDateLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.data.businessRegistrationDate$.map(function (date) {
              return ( date ) ? date.toLocaleDateString(foam.locale) : '';
            })).end()
            .start('p').add(this.BusiAddressLabel).addClass('wizardBoldLabel').end()
            .start('p').add(
              (this.data.address.suite
                  ? this.data.address.suite + '-'
                  : '')
              + this.data.address.streetNumber + ' '
              + this.data.address.streetName + ', '
              + this.data.address.city + ', '
              + this.data.address.regionId + ', '
              + this.data.address.countryId + ', '
              + this.data.address.postalCode
            ).addClass('addressDiv').end()
            .start('p').add(this.BusiLogoLabel).addClass('wizardBoldLabel').end()
            .tag({
              class: 'foam.nanos.auth.ProfilePictureView',
              ProfilePictureImage$: self.data.businessProfilePicture$,
              placeholderImage: 'images/business-placeholder.png',
              uploadHidden: true
            })

            // Principal Owner's Profile
            
            .callIf(this.data.principalOwners.length > 0, function () {
              self.start().addClass('container')
                .start().addClass('wizardBoxTitleContainer')
                  .start().add(self.BoxTitle3).addClass('wizardBoxTitleLabel').end()
                .end()
                .start()
                  .forEach(self.data.principalOwners, function (data, index) {
                    self
                    .start('p').add('Principal Owner ' + (index+1).toString()).addClass('principalOwnerLabel').end()
                    .start().addClass('principalOwnerContainer')
                      .start('p').add('Legal Name').addClass('wizardBoldLabel').end()
                      .start('p').add(data.middleName ? data.firstName + ' ' + data.middleName + ' ' + data.lastName : data.firstName + ' ' + data.lastName).end()
                      .start('p').add('Job Title').addClass('wizardBoldLabel').end()
                      .start('p').add(data.jobTitle).end()
                      .start('p').add('Email Address').addClass('wizardBoldLabel').end()
                      .start('p').add(data.email).end()
                      .start('p').add('Phone Number').addClass('wizardBoldLabel').end()
                      .start('p').add(data.phoneNumber).end()
                      .start('p').add('Date of Birth').addClass('wizardBoldLabel').end()
                      .start('p').add(data.birthday.toLocaleDateString(foam.locale)).end()
                      .start('p').add('Residential Address').addClass('wizardBoldLabel').end()
                      .start('p').add(
                        (data.address.suite
                            ? data.address.suite + '-'
                            : '')
                        + data.address.streetNumber + ' '
                        + data.address.streetName + ', '
                        + data.address.city + ', '
                        + data.address.regionId + ', '
                        + data.address.countryId + ', '
                        + data.address.postalCode
                      ).addClass('addressDiv').end()
                    .end()
                  })
                .end()
              .end()
            })
          
            // Questionaire
            .callIf(this.data.questionnaire, function () {
              self
              .start().addClass('container')
                .start().addClass('wizardBoxTitleContainer')
                  .start().add(self.BoxTitle4).addClass('wizardBoxTitleLabel').end()
                .end()
                .start()
                  .forEach(self.data.questionnaire.questions, function (question) {
                    self
                    .start().addClass('container')
                      .start('p').add(question.question).addClass('wizardBoldLabel').end()
                      .start('p').add(question.response).end()
                    .end()
                  })
                .end()
              .end()
            })
            .br()
            .br()
          .end()
        .end();
      
    }
  ]


  
});