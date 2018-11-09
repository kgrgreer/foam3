foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessRegistrationWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  requires: [
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Phone',
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo'
  ],

  imports: [
    'stack',
    'validatePostalCode',
    'validatePhone',
    'validateCity',
    'validateStreetNumber',
    'validateAddress',
    'validateEmail',
    'validateAge',
    'user',
    'userDAO'
  ],

  css: `
    ^ {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh !important;
      width: 100vw !important;
      z-index: 950;
      margin: 0 !important;
      padding: 0 !important;
    }
    ^ .wizardBody {
      width: 1000px;
      margin: auto;
      padding: 50px 0px 100px 0px;
    }
    ^ .net-nanopay-sme-onboarding-ui-BusinessForm {
      padding-bottom: 150px;
    }
    ^ .net-nanopay-sme-onboarding-ui-UserTransactionEstimateForm {
      padding-bottom: 150px;
    }
    ^ .net-nanopay-sme-onboarding-ui-SigningOfficerForm {
      padding-bottom: 150px;
    }
    ^ .net-nanopay-sme-onboarding-ui-BeneficialOwnershipForm {
      padding-bottom: 150px;
    }
    ^ .stackColumn {
      display: inline-block;
      width: calc(100% - 300px);
      height: calc(100% - 65px);
      box-sizing: border-box;
      position: relative;
      top: -35px;
      overflow-y: scroll;
      vertical-align: top;
      -ms-overflow-style: none;  // IE 10+
      overflow: -moz-scrollbars-none;  // Firefox
    }
    ^ .stackColumn::-webkit-scrollbar { 
      display: none;  // Safari and Chrome
    }
  `,

  messages: [
    { name: 'SaveSuccessfulMessage', message: 'Progress saved.' },
    { name: 'SaveFailureMessage', message: 'Could not save your changes. Please try again.' },
    { name: 'SubmitSuccessMessage', message: 'Registration submitted successfully! You will receive a confirmation email in your mailbox' },
    { name: 'SubmitFailureMessage', message: 'Registration submission failed. Please try again later.' },
    { name: 'ErrorMissingFields', message: 'Please fill out all necessary fields before proceeding.' },
    { name: 'ErrorAdminJobTitleMessage', message: 'Job title required.' },
    { name: 'ErrorAdminNumberMessage', message: 'Invalid phone number.' },
    { name: 'ErrorBusinessProfileNameMessage', message: 'Business name required.' },
    { name: 'ErrorBusinessProfilePhoneMessage', message: 'Invalid business phone number.' },
    { name: 'ErrorBusinessProfileTypeMessage', message: 'Business type required.' },
    { name: 'ErrorBusinessProfileRegistrationNumberMessage', message: 'Business registration number required.' },
    { name: 'ErrorBusinessProfileRegistrationAuthorityMessage', message: 'Business registration authority required.' },
    { name: 'ErrorBusinessProfileRegistrationDateMessage', message: 'Invalid business registration date.' },
    { name: 'ErrorBusinessProfileStreetNumberMessage', message: 'Invalid street number.' },
    { name: 'ErrorBusinessProfileStreetNameMessage', message: 'Invalid street name.' },
    { name: 'ErrorBusinessProfileCityMessage', message: 'Invalid city name.' },
    { name: 'ErrorBusinessProfilePostalCodeMessage', message: 'Invalid postal code.' },
    { name: 'ErrorQuestionnaireMessage', message: 'You must answer each question.' },
    { name: 'ErrorFirstNameTooLong', message: 'First name cannot exceed 70 characters.' },
    { name: 'ErrorFirstNameDigits', message: 'First name cannot contain numbers.' },
    { name: 'ErrorMiddleNameTooLong', message: 'Middle name cannot exceed 70 characters.' },
    { name: 'ErrorMiddleNameDigits', message: 'Middle name cannot contain numbers.' },
    { name: 'ErrorLastNameTooLong', message: 'Last name cannot exceed 70 characters.' },
    { name: 'ErrorLastNameDigits', message: 'Last name cannot contain numbers.' },
    { name: 'ErrorTermsAndConditionsMessage', message: 'Please accept the terms and conditions.' }
  ],

  methods: [
    function init() {
      this.hasSaveOption = true;
      this.viewData.user = this.user;

      this.title = 'Your Business Profile';

      this.saveLabel = 'Save and exit';

      this.viewTitles = [
        'Getting Started',
        'Your Business',
        'Your Transactions',
        'Signing Officer',
        'Beneficial Ownership'
      ],

      this.views = [
        { id: 'business-registration-introduction', view: { class: 'net.nanopay.sme.onboarding.ui.IntroductionView' } },
        { id: 'business-registration-business-form', view: { class: 'net.nanopay.sme.onboarding.ui.BusinessForm' } },
        { id: 'business-registration-transaction-estimate-form', view: { class: 'net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm' } },
        { id: 'business-registration-signing-officer-form', view: { class: 'net.nanopay.sme.onboarding.ui.SigningOfficerForm' } },
        { id: 'business-registration-beneficial-owner-form', view: { class: 'net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm' } }
      ];
      this.viewData.user = this.user;
      this.viewData.suggestedUserTransactionInfo = this.user.suggestedUserTransactionInfo ?
          this.user.suggestedUserTransactionInfo : this.SuggestedUserTransactionInfo.create({});
      this.viewData.identification = {};
      this.viewData.principalUser = {};
      this.SUPER();
    },
    function validateAdminInfo() {
      var editedUser = this.viewData.user;
      if ( ! editedUser.firstName ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorMissingFields, type: 'error' }));
        return false;
      }
      if ( editedUser.firstName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorFirstNameTooLong, type: 'error' }));
        return false;
      }
      if ( /\d/.test(editedUser.firstName) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorFirstNameDigits, type: 'error' }));
        return false;
      }

      if ( editedUser.middleName ) {
        if ( editedUser.middleName.length > 70 ) {
          this.add(this.NotificationMessage.create({ message: this.ErrorMiddleNameTooLong, type: 'error' }));
          return false;
        }

        if ( /\d/.test(editedUser.middleName) ) {
          this.add(this.NotificationMessage.create({ message: this.ErrorMiddleNameDigits, type: 'error' }));
          return false;
        }
      }

      if ( ! editedUser.lastName ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorMissingFields, type: 'error' }));
        return false;
      }
      if ( editedUser.lastName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorLastNameTooLong, type: 'error' }));
        return false;
      }
      if ( /\d/.test(editedUser.lastName) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorLastNameDigits, type: 'error' }));
        return false;
      }

      if ( ! editedUser.jobTitle ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorAdminJobTitleMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validatePhone(editedUser.phone.number) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorAdminNumberMessage, type: 'error' }));
        return false;
      }
      return true;
    },

    function validateBusinessProfile() {
      var businessProfile = this.viewData.user;

      if ( ! businessProfile.organization ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileNameMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validatePhone(businessProfile.businessPhone.number) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfilePhoneMessage, type: 'error' }));
        return false;
      }

      var businessAddress = businessProfile.businessAddress;
      if ( ! this.validateStreetNumber(businessAddress.streetNumber) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileStreetNumberMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validateAddress(businessAddress.streetName) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileStreetNameMessage, type: 'error' }));
        return false;
      }

      if ( businessAddress.suite && ! this.validateAddress(businessAddress.suite) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileStreetNameMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validateCity(businessAddress.city) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileCityMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validatePostalCode(businessAddress.postalCode) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfilePostalCodeMessage, type: 'error' }));
        return false;
      }
      return true;
    },
    function saveProgress(andLogout) {
      var self = this;

      this.user = this.viewData.user;
      this.userDAO.put(this.user).then(function(result) {
        if ( ! result ) throw new Error(self.SaveFailureMessage);
        self.user.copyFrom(result);
        self.add(self.NotificationMessage.create({ message: self.SaveSuccessfulMessage }));
        self.stack.back();
      }).catch(function(err) {
        self.add(self.NotificationMessage.create({ message: self.SaveFailureMessage, type: 'error' }));
      });
    }
  ],


  actions: [
    {
      name: 'save',
      isAvailable: function(position) {
        return ( position < this.views.length - 1 );
      },
      code: function() {
        this.saveProgress();
      }
    },
    {
      name: 'goNext',
      isAvailable: function(position) {
        return ( position < this.views.length - 1 );
      },
      code: function() {
        // move to next screen
        if ( this.position < this.views.length - 1 ) {
          if ( this.position === 1 ) {
            // validate Business Profile
            if ( ! this.validateBusinessProfile() ) return;
          }
          if ( this.position === 2 ) {
            if ( this.addPrincipalOwnersForm.isFillingPrincipalOwnerForm() ) {
              if ( ! this.addPrincipalOwnersForm.validatePrincipalOwner() ) return;
              this.addPrincipalOwnersForm.addPrincipalOwner();
            }
          }
          if ( this.position === 3 ) {
            // validate Questionnaire
            if ( ! this.validateQuestionnaire() ) return;
          }
          // validate checkbox
          if ( this.position === 4 ) {
            if ( ! this.validateTermAndCondition() ) return;
          }

          this.subStack.push(this.views[this.subStack.pos + 1].view);
        }
      }
    }
  ]
});
