foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'ViewSubmittedProfileView',
  extends: 'foam.u2.Controller',

  documentation: 'Allows user to view their previously submitted registration profile.',

  imports: [
    'businessTypeDAO',
    'stack',
    'user'
  ],

  css: `
    ^ .container {
      width: 540px;
    }
    ^ .header {
      font-size: 30px;
      font-weight: bold;
      font-style: normal;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 0.5px;
      text-align: left;
      color: #093649;
    }
    ^ .closeIcon {
      background-color: %PRIMARYCOLOR%;
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
    ^ .net-nanopay-ui-ActionView-backToHome {
      color: white;
      background: %SECONDARYCOLOR%;
    }
    ^ .principalOwnerLabel {
      margin-top: 20px;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      letter-spacing: 0.2px;
      color: #093649;
    }
    ^ .principalOwnerContainer {
      padding-left: 25px;
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
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'files'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();

      var self = this;

      this.businessTypeDAO.find(this.user.businessTypeId).then(function(a) {
        self.businessTypeName = a.name;
      });

      this
        .addClass(this.myClass())
        .start()
          .start().addClass('container')
            .add(this.BACK_TO_HOME)
            .start('p').add(this.Title).addClass('header').end()
            .start('p').add(this.Description).addClass('description').end()

            // Previously submitted additional documents
            .start().addClass('wizardBoxTitleContainer')
              .start().add(this.BoxTitle1).addClass('wizardBoxTitleLabel').end()
              .start().add(this.CloseLabel).addClass('closeLabel').end()
              .start(this.CLOSE_DOCUMENTS).addClass('closeIcon').end()
            .end()
            .add(this.slot(function (data) {
              var e = this.E();
              for ( var i = 0 ; i < data.length ; i++ ) {
                e.tag({
                  class: 'net.nanopay.invoice.ui.InvoiceFileView',
                  data: data[i],
                  fileNumber: i + 1,
                });
              }
              return e;
            }, this.files$))

            // Business Profile
            .start().addClass('wizardBoxTitleContainer')
              .start().add(this.BoxTitle2).addClass('wizardBoxTitleLabel').end()
              .start().add(this.CloseLabel).addClass('closeLabel').end()
              .start(this.CLOSE_BUSINESS_PROFILE).addClass('closeIcon').end()
            .end()
            .start('p').add(this.BusiNameLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.user.businessName).end()
            .start('p').add(this.BusiPhoneLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.user.businessPhone.number).end()
            .start('p').add(this.BusiWebsiteLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.user.website).end()
            .start('p').add(this.BusiTypeLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.businessTypeName$).end()
            .start('p').add(this.BusiRegNumberLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.user.businessRegistrationNumber).end()
            .start('p').add(this.BusiRegAuthLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.user.businessRegistrationAuthority).end()
            .start('p').add(this.BusiRegDateLabel).addClass('wizardBoldLabel').end()
            .start('p').add(this.user.businessRegistrationDate$.map(function (date) {
              return ( date ) ? date.toISOString().substring(0, 10) : '';
            })).end()
            .start('p').add(this.BusiAddressLabel).addClass('wizardBoldLabel').end()
            .start('p').add(
              this.user.businessAddress.streetNumber + ' '
              + this.user.businessAddress.streetName + ', '
              + this.user.businessAddress.address2 + ' '
              + this.user.businessAddress.city + ', '
              + this.user.businessAddress.postalCode
            ).addClass('addressDiv').end()
            .start('p').add(this.BusiLogoLabel).addClass('wizardBoldLabel').end()    
            .tag({
              class: 'foam.nanos.auth.ProfilePictureView',
              data: this.user.businessProfilePicture,
              placeholderImage: 'images/business-placeholder.png',
              uploadHidden: true
            })

            // Principal Owner's Profile
            .start().addClass('wizardBoxTitleContainer')
              .start().add(this.BoxTitle3).addClass('wizardBoxTitleLabel').end()
              .start().add(this.CloseLabel).addClass('closeLabel').end()
              .start(this.CLOSE_PRINCIPAL_OWNER).addClass('closeIcon').end()
            .end()
            .start('div')
              .forEach(this.user.principalOwners, function (data, index) {
                self
                .start('p').add('Principal Owner ' + (index+1).toString()).addClass('principalOwnerLabel').end()
                .start().addClass('principalOwnerContainer')
                  .start('p').add('Legal Name').addClass('wizardBoldLabel').end()
                  .start('p').add(data.middleName ? data.firstName + ' ' + data.middleName + ' ' + data.lastName : data.firstName + ' ' + data.lastName).end()
                  .start('p').add('Email Address').addClass('wizardBoldLabel').end()
                  .start('p').add(data.email).end()
                  .start('p').add('Phone Number').addClass('wizardBoldLabel').end()
                  .start('p').add(data.phone.number).end()
                  .start('p').add('Principal Type').addClass('wizardBoldLabel').end()
                  .start('p').add(data.principleType).end()
                  .start('p').add('Date of Birth').addClass('wizardBoldLabel').end()          
                  .start('p').add(data.birthday.toISOString().substring(0,10)).end()
                  .start('p').add('Residential Address').addClass('wizardBoldLabel').end()
                  .start('p').add(
                      data.address.streetNumber + ' '
                    + data.address.streetName + ', '
                    + data.address.address2 + ' '
                    + data.address.city + ', '
                    + data.address.postalCode
                  ).addClass('addressDiv').end()
                .end()
              }).end()
              .end()
            .end()

            //Questionnaire
            .start().addClass('wizardBoxTitleContainer')
              .start().add(this.BoxTitle4).addClass('wizardBoxTitleLabel').end()
              .start().add(this.CloseLabel).addClass('closeLabel').end()
              .start(this.CLOSE_QUESTIONNAIRE).addClass('closeIcon').end()
            .end()
            .start('div')
            .forEach(this.user.questionnaire.questions, function (question) {
              self
                .start('p').add(question.question).addClass('wizardBoldLabel').end()
                .start('p').add(question.response).end()
            }).end()
 
          .end()
        .end();
    }
  ],

  actions: [
    {
      name: 'backToHome',
      label: '<< Back to Home',
      code: function(X) {
        this.stack.back();
      }
    },
    {
      name: 'closeDocuments',
      icon: 'images/ic-void.svg',
      code: function(X) {
        // close additional documents
      }
    },
    {
      name: 'closeBusinessProfile',
      icon: 'images/ic-void.svg',
      code: function(X) {
        // close business profile
      }
    },
    {
      name: 'closePrincipalOwner',
      icon: 'images/ic-void.svg',
      code: function(X) {
        // close principal owner's profile
      }
    },
    {
      name: 'closeQuestionnaire',
      icon: 'images/ic-void.svg',
      code: function(X) {
        // close questionnaire
      }
    }
  ]
});