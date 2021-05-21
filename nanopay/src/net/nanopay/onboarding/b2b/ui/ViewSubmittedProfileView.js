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
  name: 'ViewSubmittedProfileView',
  extends: 'foam.u2.View',

  documentation: 'Allows user to view their previously submitted registration profile.',

  imports: [
    'businessTypeDAO',
    'questionnaireDAO',
    'stack',
    'user',
    'userDAO'
  ],

  css: `
    ^ .container {
      width: 540px;
      margin: 0 auto;
    }
    ^ .header {
      font-size: 30px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .closeIcon {
      background-color: /*%BLACK%*/ #1e1f21;
      width: 20px;
      height: 20px;
      float: right;
      position: relative;
      bottom: 19;
      right: 30;
      cursor: pointer;
    }
    ^ .closeLabel {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #ffffff;
      float: right;
      position: relative;
      right: 20;
      bottom: 17;
    }
    ^ .foam-u2-ActionView-backToHome {
      color: white;
      background: /*%PRIMARY3%*/ #406dea;
      margin-top: 20px;
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
    ^ .foam-u2-ActionView-remove {
       display: none;
    }
  `,

  messages: [
    { name: 'Title', message: 'View Submitted Registration Profile' },
    { name: 'Description', message: 'You can view the registration details, but please be aware that you can no longer edit the profile. If you want to make any changes, please contact support@yourcompany.com.' },
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
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.businessTypeDAO.find(this.user.businessTypeId).then(function(a) {
        self.businessTypeName = a.name;
      });

      if ( ! this.user.questionnaire ) {
        this.questionnaireDAO.find('b2b').then(function (result) {
          self.user.questionnaire = result;
          return self.userDAO.put(self.user);
        });
      }

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .add(this.BACK_TO_HOME)
            .start('p').add(this.Title).addClass('header').end()
            .start('p').add(this.Description).addClass('description').end()
            .tag({ class: 'net.nanopay.admin.ui.ReviewProfileView', data$: this.user$ })
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'backToHome',
      label: '<< Back to Home',
      code: function(X) {
        X.stack.push({ 
          class: 'net.nanopay.onboarding.b2b.ui.B2BOnboardingWizard',
          pushView: { position: 5, view: { class: 'net.nanopay.onboarding.b2b.ui.ProfileSubmittedForm' } }
        })
      }
    }
  ]
});
