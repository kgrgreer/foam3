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
  name: 'ReviewAndSubmitForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form for reviewing details of a new user before adding',

  imports: [
    'appConfig',
    'businessTypeDAO',
    'countryDAO',
    'regionDAO',
    'user'
  ],

  css: `
    ^ .editImage {
      background-color: /*%BLACK%*/ #1e1f21;
      width: fit-content;
      height: 20px;
      float: right;
      position: relative;
      bottom: 19;
      right: 10;
      cursor: pointer;
    }
    ^ .editLabel {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #ffffff;
      line-height: 20px;
    }
    ^ .editImage img {
      vertical-align: middle;
    }
    ^ .editLabel span {
      margin-left: 8px;
      vertical-align: middle;
    }
    ^ .principalOwnerLabel {
      margin-top: 20px;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .principalOwnerContainer {
      padding-left: 25px;
    }
    ^ .addressDiv {
      width: 220px;
    }
    ^ .busiLogo {
      border: none;
      padding: 0;
      height: inherit;
    }
    ^ .foam-nanos-auth-ProfilePictureView {
      width: 150px;
    }
    ^ .termAndCondition {
      width: 354px;
      height: 16px;
      font-size: 14px;
      letter-spacing: 0.2px;
      color: /*%BLACK%*/ #1e1f21;
      margin: 20px;
    }
    ^ .termAndConditionBox {
      background-color: white;
      width: 540px;
      height: 400px;
    }
    ^ .iframeContainer {
      width: 540px;
      height: 320;
      border-width: 0px;
    }
    ^ .checkBoxDiv {
      float: right;
      text-align: right;
      margin-top: 15px;
      margin-right: 20px;
      color: #a4b3b8;
    }
    ^ .foam-u2-ActionView-printButton {
      height: 40px;
      width: 70px;
      margin-top: 15px;
      margin-left: 20px;
    }
    ^ .foam-u2-ActionView-printButton span{
      margin-left: 5px;
    }
    ^ .checkBoxLabel.enabled {
      color: /*%BLACK%*/ #1e1f21
    }
    ^ .foam-u2-md-CheckBox {
      width: 14px;
      height: 14px;
      margin-bottom: 1px;
      vertical-align: bottom;
      border: solid 1px #a4b3b8;
    }
    ^ .foam-u2-md-CheckBox.enabled {
      border: solid 1px /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-md-CheckBox:checked {
      background-color: /*%BLACK%*/ #1e1f21;
    }
    ^ .foam-u2-md-CheckBox:checked:after {
      background-image: url("images/check-mark.png");
      background-size: 12px 13px;
      display: inline-block;
      width: 12px; 
      height: 13px;
      content:"";
    }
    ^ .hint {
      margin-top: 7px;
    }
  `,

  messages: [
    { name: 'Title', message: 'Review and Submit' },
    { name: 'Description', message: 'Please review your profile details before submitting.' },
    { name: 'BoxTitle1', message: '1. Business Profile' },
    { name: 'BoxTitle2', message: '2. Principal Owner(s) Profile' },
    { name: 'BoxTitle3', message: '3. Questionaire' },
    { name: 'BoxTitle4', message: '4. Terms & Conditions' },
    { name: 'EditLabel', message: 'Edit' },
    { name: 'BusiNameLabel', message: 'Registered Business Name' },
    { name: 'BusiPhoneLabel', message: 'Business Phone' },
    { name: 'BusiWebsiteLabel', message: 'Website (optional)' },
    { name: 'BusiTypeLabel', message: 'Business Type' },
    { name: 'BusiRegNumberLabel', message: 'Business Registration Number' },
    { name: 'BusiRegAuthLabel', message: 'Registration Authority' },
    { name: 'BusiRegDateLabel', message: 'Registration Date' },
    { name: 'BusiAddressLabel', message: 'Business Address' },
    { name: 'BusiLogoLabel', message: 'Business Logo (optional)' }
  ],

  properties: [
    'businessCountry',
    'businessRegion',
    'businessTypeName',
    'fileHeight',
    {
      class: 'Boolean',
      name: 'checkBox',
      factory: function() {
        return this.viewData.checkBox;
      },
      postSet: function(o, n) {
        this.viewData.checkBox = n;
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.businessTypeDAO.find(this.viewData.user.businessTypeId).then(function(a) {
        self.businessTypeName = a.name;
      });

      this.regionDAO.find(this.viewData.user.address.regionId).then(function(a) {
        self.businessRegion = a.name;
      });

      this.countryDAO.find(this.viewData.user.address.countryId).then(function(a) {
        self.businessCountry = a.name;
      });

      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Description).addClass('wizardDescription').end()

          // Business Profile
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle1).addClass('wizardBoxTitleLabel').end()
            .start(this.EDIT_BUSINESS_PROFILE).addClass('editImage').addClass('editLabel').end()
          .end()
          .start('p').add(this.BusiNameLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessName).end()
          .start('p').add(this.BusiPhoneLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.phoneNumber).end()
          .start('p').add(this.BusiWebsiteLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.website).end()
          .start('p').add(this.BusiTypeLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.businessTypeName$).end()
          .start('p').add(this.BusiRegNumberLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessRegistrationNumber).end()
          .start('p').add(this.BusiRegAuthLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessRegistrationAuthority).end()
          .start('p').add(this.BusiRegDateLabel).addClass('wizardBoldLabel').end()
          .start('p').add(this.viewData.user.businessRegistrationDate.toLocaleDateString(foam.locale)).end()
          .start('p').add(this.BusiAddressLabel).addClass('wizardBoldLabel').end()
          .start('p').add(((a) => {
            return (a.suite ? a.suite + '-' : '')
                + a.streetNumber + ' '
                + a.streetName + ', '
                + a.city + ', '
                + a.regionId + ', '
                + a.countryId + ', '
                + a.postalCode;
          })(this.viewData.user.address))
          .addClass('addressDiv').end()
          .start('p').add(this.BusiLogoLabel).addClass('wizardBoldLabel').end()
          .tag({
            class: 'foam.nanos.auth.ProfilePictureView',
            ProfilePictureImage: self.viewData.user.businessProfilePicture,
            placeholderImage: 'images/business-placeholder.png',
            uploadHidden: true
          })

          // Principal Owner's Profile
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle2).addClass('wizardBoxTitleLabel').end()
            .start(this.EDIT_PRINCIPAL_OWNER).addClass('editImage').addClass('editLabel').end()
          .end()
          .start('div')
            .forEach(this.viewData.user.principalOwners, function(data, index) {
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
                    (data.address.suite ? data.address.suite + '-' : '')
                  + data.address.streetNumber + ' '
                  + data.address.streetName + ', '
                  + data.address.city + ', '
                  + data.address.regionId + ', '
                  + data.address.countryId + ', '
                  + data.address.postalCode
                ).addClass('addressDiv').end()
              .end();
            }).end()
          .end()

          // Questionaire
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle3).addClass('wizardBoxTitleLabel').end()
            .start(this.EDIT_QUESTIONAIRE).addClass('editImage').addClass('editLabel').end()
          .end()
          .start('div')
          .forEach(this.viewData.user.questionnaire.questions, function(question) {
            self
              .start('p').add(question.question).addClass('wizardBoldLabel').end()
              .start('p').add(question.response).end();
          }).end()

          // Terms and conditions
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle4).addClass('wizardBoxTitleLabel').end()
          .end()
          .start().addClass('termAndCondition')
            .add('Please agree on the Terms & Conditions before submit.')
          .end()
          .start()
            .addClass('termAndConditionBox')
            .start('iframe').addClass('iframeContainer')
              .attrs({
                  src: this.appConfig.url + 'service/terms',
                  id: 'print-iframe',
                  name: 'print-iframe',
              })
              .on('load', this.getFileHeight)
            .end()
            .start(this.PRINT_BUTTON)
              .tag({ class: 'foam.u2.tag.Image', data: 'images/ic-print.svg' })
            .end()
            .start().addClass('checkBoxDiv')
              .start({ class: 'foam.u2.md.CheckBox' },
                  { mode: foam.u2.DisplayMode.DISABLED,
                  data$: this.checkBox$ })
              .end()
              .start('label').addClass('checkBoxLabel')
                .add('I agree to the Terms & Conditions')
              .end()
              .start().addClass('hint')
                .add('*Scroll to the bottom to agree.')
              .end()
            .end()
          .end()
        .end();
    }
  ],

  listeners: [
    {
      name: 'getFileHeight',
      code: function() {
        var container
            = document.getElementsByClassName('iframeContainer')[0];
        this.fileHeight = container.contentDocument.body.scrollHeight;
        container.contentDocument.onscroll = this.checkScrollPosition;
      }
    },
    {
      name: 'checkScrollPosition',
      code: function() {
        var container
            = document.getElementsByClassName('iframeContainer')[0];
        var pos = container.contentDocument.scrollingElement.scrollTop;

        // If user scroll to the bottom of the terms & conditions
        if ( pos + container.contentWindow.innerHeight >= this.fileHeight ) {
          var checkBox
              = document.getElementsByClassName('foam-u2-md-CheckBox')[0];
          checkBox.removeAttribute('disabled');
          checkBox.classList.add('enabled');

          var checkBoxLabel
              = document.getElementsByClassName('checkBoxLabel')[0];
          checkBoxLabel.classList.add('enabled');
        }
      }
    }
  ],

  actions: [
    {
      name: 'editBusinessProfile',
      icon: 'images/ic-draft.svg',
      label: 'Edit',
      code: function(X) {
        this.goTo(1);
      }
    },
    {
      name: 'editPrincipalOwner',
      icon: 'images/ic-draft.svg',
      label: 'Edit',
      code: function(X) {
        this.goTo(2);
      }
    },
    {
      name: 'editQuestionaire',
      icon: 'images/ic-draft.svg',
      label: 'Edit',
      code: function(X) {
        this.goTo(3);
      }
    },
    {
      name: 'printButton',
      label: 'Print',
      code: function(X) {
        X.window.frames['print-iframe'].focus();
        X.window.frames['print-iframe'].print();
      }
    }
  ]
});
