foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'ReviewAndSubmitForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  documentation: 'Form for reviewing details of a new user before adding',

  imports: [
    'businessTypeDAO'
  ],

  css: `
    ^ .editImage {
      background-color: %PRIMARYCOLOR%;
      width: 20px;
      height: 20px;
      float: right;
      position: relative;
      bottom: 19;
      right: 30;
      cursor: pointer;
    }
    ^ .editLabel {
      font-size: 14px;
      font-weight: bold;
      letter-spacing: 0.2px;
      color: #ffffff;
      float: right;
      position: relative;
      right: 20;
      bottom: 17;
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
    ^ .addressDiv {
      width: 220px;
    }
  `,

  messages: [
    { name: 'Title', message: 'Review and Submit' },
    { name: 'Description', message: 'Please review your profile details before submitting.' },
    { name: 'BoxTitle1', message: '1. Business Profile' },
    { name: 'BoxTitle2', message: '2. Principal Owner(s) Profile' },
    { name: 'BoxTitle3', message: '3. Questionaire' },
    { name: 'EditLabel', message: 'Edit'},
    { name: 'BusiNameLabel', message: 'Registered Business Name' },
    { name: 'BusiPhoneLabel', message: 'Business Phone' },
    { name: 'BusiWebsiteLabel', message: 'Website (optional)' },
    { name: 'BusiTypeLabel', message: 'Business Type' },
    { name: 'BusiRegNumberLabel', message: 'Business Registration Number' },
    { name: 'BusiRegAuthLabel', message: 'Registration Authority'},
    { name: 'BusiRegDateLabel', message: 'Registration Date' },
    { name: 'BusiAddressLabel', message: 'Business Address' },
    { name: 'BusiLogoLabel', message: 'Business Logo (optional)' },
    { name: 'PrincOwner1Label', message: 'Principal Owner 1' },
    { name: 'PrincOwner2Label', message: 'Principal Owner 2' },
    { name: 'PrincJobtitleLabel', message: 'Job Title' },
    { name: 'PrincNameLabel', message: 'Legal Name' },
    { name: 'PrincEmailLabel', message: 'Email Address' },
    { name: 'PrincPhoneLabel', message: 'Phone Number' },
    { name: 'PrincTypeLabel', message: 'Principal Type' },
    { name: 'PrincBdayLabel', message: 'Date of Birth' },
    { name: 'PrincAddressLabel', message: 'Residential Address' }
  ],

  methods: [
    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('p').add(this.Description).addClass('wizardDescription').end()

          // Business Profile
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle1).addClass('wizardBoxTitleLabel').end()
            .start().add(this.EditLabel).addClass('editLabel').end()
            .start(this.EDIT_BUSINESS_PROFILE).addClass('editImage').end()
          .end()
          .start('p').add(this.BusiNameLabel).addClass('wizardBoldLabel').end()
          .start('p').add('nanopay').end()
          .start('p').add(this.BusiPhoneLabel).addClass('wizardBoldLabel').end()
          .start('p').add('+1 9054248118').end()
          .start('p').add(this.BusiWebsiteLabel).addClass('wizardBoldLabel').end()
          .start('p').add('www.nanopay.net').end()
          .start('p').add(this.BusiTypeLabel).addClass('wizardBoldLabel').end()
          .start('p').add('Sole Proprietorship').end()
          .start('p').add(this.BusiRegNumberLabel).addClass('wizardBoldLabel').end()
          .start('p').add('123456789').end()
          .start('p').add(this.BusiRegAuthLabel).addClass('wizardBoldLabel').end()
          .start('p').add('nanopay').end()
          .start('p').add(this.BusiRegDateLabel).addClass('wizardBoldLabel').end()
          .start('p').add('2018-12-25').end()
          .start('p').add(this.BusiAddressLabel).addClass('wizardBoldLabel').end()
          .start('p').add('171 East Liberty Street, Suite 340 Toronto, ON, Canada, M6K 3P6').addClass('addressDiv').end()
          .start('p').add(this.BusiLogoLabel).addClass('wizardBoldLabel').end()
          .start({ class: 'foam.u2.tag.Image', data: 'images/business-placeholder.png' }).addClass('busiLogo').end()
          
          // Principal Owner's Profile
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle2).addClass('wizardBoxTitleLabel').end()
            .start().add(this.EditLabel).addClass('editLabel').end()
            .start(this.EDIT_PRINCIPAL_OWNER).addClass('editImage').end()
          .end()
          .start('p').add(this.PrincOwner1Label).addClass('principalOwnerLabel').end()
          .start().addClass('principalOwnerContainer')
            .start('p').add(this.PrincNameLabel).addClass('wizardBoldLabel').end()
            .start('p').add('Mark Bastin').end()
            .start('p').add(this.PrincEmailLabel).addClass('wizardBoldLabel').end()
            .start('p').add('blake@nanopay.net').end()
            .start('p').add(this.PrincPhoneLabel).addClass('wizardBoldLabel').end()
            .start('p').add('+1 9054248118').end()
            .start('p').add(this.PrincTypeLabel).addClass('wizardBoldLabel').end()
            .start('p').add('Director').end()
            .start('p').add(this.PrincBdayLabel).addClass('wizardBoldLabel').end()          
            .start('p').add('2018-03-16').end()
            .start('p').add(this.PrincAddressLabel).addClass('wizardBoldLabel').end()
            .start('p').add('171 East Liberty Street, Suite 340 Toronto, ON, Canada, M6K 3P6').addClass('addressDiv').end()
          .end()
          .start('p').add(this.PrincOwner2Label).addClass('principalOwnerLabel').end()
          .start().addClass('principalOwnerContainer')
            .start('p').add(this.PrincNameLabel).addClass('wizardBoldLabel').end()
            .start('p').add('Mark Bastin').end()
            .start('p').add(this.PrincEmailLabel).addClass('wizardBoldLabel').end()
            .start('p').add('blake@nanopay.net').end()
            .start('p').add(this.PrincPhoneLabel).addClass('wizardBoldLabel').end()
            .start('p').add('+1 9054248118').end()
            .start('p').add(this.PrincTypeLabel).addClass('wizardBoldLabel').end()
            .start('p').add('Director').end()
            .start('p').add(this.PrincBdayLabel).addClass('wizardBoldLabel').end()          
            .start('p').add('2018-03-16').end()
            .start('p').add(this.PrincAddressLabel).addClass('wizardBoldLabel').end()
            .start('p').add('171 East Liberty Street, Suite 340 Toronto, ON, Canada, M6K 3P6').addClass('addressDiv').end()
          .end()

          // Questionaire
          .start().addClass('wizardBoxTitleContainer')
            .start().add(this.BoxTitle3).addClass('wizardBoxTitleLabel').end()
            .start().add(this.EditLabel).addClass('editLabel').end()
            .start(this.EDIT_QUESTIONAIRE).addClass('editImage').end()
          .end()
          .start('p').add('How many invoices does your business create per month ?').addClass('wizardBoldLabel').end()
          .start('p').add('1200').end()
          .start('p').add('How many invoices does your business receive per month ?').addClass('wizardBoldLabel').end()
          .start('p').add('500').end()
          .start('p').add('What is the average invoice amount per month (in CAD) ?').addClass('wizardBoldLabel').end()
          .start('p').add('4000000').end()

        .end();
    }
  ],

  actions: [
    {
      name: 'editBusinessProfile',
      icon: 'images/ic-draft.svg',
      code: function(X) {
        this.goTo(1);
      }
    },
    {
      name: 'editPrincipalOwner',
      icon: 'images/ic-draft.svg',
      code: function(X) {
        this.goTo(2);
      }
    },
    {
      name: 'editQuestionaire',
      icon: 'images/ic-draft.svg',
      code: function(X) {
        this.goTo(3);
      }
    }
    
  ]

});