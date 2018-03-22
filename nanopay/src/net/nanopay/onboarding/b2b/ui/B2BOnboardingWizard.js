foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'B2BOnboardingWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Onboarding Wizard for new B2B users.',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup',
    'net.nanopay.admin.model.AccountStatus'
  ],

  imports: [
    'stack',
    'auth',
    'window',
    'validatePostalCode',
    'validatePhone',
    'validateCity',
    'validateStreetNumber',
    'validateAddress',
    'user',
    'userDAO'
  ],

  exports: [
    'logOutHandler'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  properties: [
    {
      class: 'String',
      name: 'nextLabel',
      expression: function (position) {
        return ( position < this.views.length - 2 ) ? 'Next' : 'Submit';
      }
    }
  ],

  messages: [
    { name: 'SaveSuccessfulMessage', message: 'Progress saved.' },
    { name: 'SaveFailureMessage', message: 'Could not save your changes. Please try again.' },
    { name: 'SubmitSuccessMessage', message: 'Registration submitted successfully! You will receive a confirmation email in your mailbox' },
    { name: 'SubmitFailureMessage', message: 'Registration submission failed. Please try again later.' },
    { name: 'ErrorAdminNameMessage', message: 'Invalid first and or last name.' },
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
    { name: 'ErrorQuestionnaireMessage', message: 'You must answer each question.' }
  ],

  methods: [
    function init() {
      var self = this;
      this.title = 'Registration';
      this.exitLabel = 'Log Out';
      this.viewData.user = this.user;
      this.views = [
        { parent: 'addB2BUser', id: 'form-addB2BUser-confirmAdminInfo', label: 'Confirm Admin Info', view: { class: 'net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-businessProfile', label: 'Business Profile', view: { class: 'net.nanopay.onboarding.b2b.ui.BusinessProfileForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-principalOwner', label: 'Principal Owner(s) Profile', view: { class: 'net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-questionnaire',  label: 'Questionnaire', view: { class: 'net.nanopay.onboarding.b2b.ui.QuestionnaireForm', id: 'b2b' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-reviewAndSubmit', label: 'Review and Submit', view: { class: 'net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-profileSubmitted', label: this.user.status$.map(function (status) {
          switch ( status ) {
            case self.AccountStatus.ACTIVE:
              return 'Registration has been approved.';
            case self.AccountStatus.DISABLED:
              return 'Registration is temporarily disabled.';
            default:
              return 'Registration is under review.';
          }
        }), hidden: true, view: { class: 'net.nanopay.onboarding.b2b.ui.ProfileSubmittedForm' } }
      ];
      this.SUPER();
    },

    function logOutHandler(selection) {
      switch(selection) {
        case 0:
          this.logOut();
          break;
        case 1:
          this.saveProgress(true);
          break;
        default:
          console.error('unhandled response');
      }
    },

    function saveProgress(andLogout) {
      var self = this;

      this.user = this.viewData.user;

      this.userDAO.put(this.user).then(function(result) {
        if ( ! result ) throw new Error(self.SaveFailureMessage);
        self.user.copyFrom(result);
        self.add(self.NotificationMessage.create({ message: self.SaveSuccessfulMessage }));
        if ( andLogout ) self.logOut();
      }).catch(function(err){
        self.add(self.NotificationMessage.create({ message: self.SaveFailureMessage, type: 'error' }));
      });
    },

    function submit() {
      var self = this;

      this.user = this.viewData.user;
      this.user.status = this.AccountStatus.SUBMITTED;

      this.userDAO.put(this.user).then(function (result) {
        if ( ! result ) throw new Error(self.SubmitFailureMessage);
        self.user.copyFrom(result);
        self.add(self.NotificationMessage.create({ message: self.SubmitSuccessMessage }));
        self.subStack.push(self.views[self.subStack.pos + 1].view);
      }).catch(function (err) {
        self.add(self.NotificationMessage.create({ message: self.SubmitFailureMessage, type: 'error' }));
      });
    },

    function logOut() {
      var self = this;
      this.auth.logout().then(function() {
        self.window.location.hash = '';
        self.window.location.reload();
      });
    },

    function validateAdminInfo() {
      var editedUser = this.viewData.user;
      if ( ! editedUser.firstName || ! editedUser.lastName ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorAdminNameMessage, type: 'error' }));
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
      if ( ! businessProfile.businessName ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileNameMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validatePhone(businessProfile.businessPhone.number) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfilePhoneMessage, type: 'error' }));
        return false;
      }

      if ( ! businessProfile.businessRegistrationNumber ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileRegistrationNumberMessage, type: 'error' }));
        return false;
      }

      if ( ! businessProfile.businessRegistrationAuthority ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileRegistrationAuthorityMessage, type: 'error' }));
        return false;
      }

      if ( ! businessProfile.businessRegistrationDate ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileRegistrationDateMessage, type: 'error' }));
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

      if ( businessAddress.address2 && ! this.validateAddress(businessAddress.address2) ) {
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

    function validateQuestionnaire() {
      var questions = this.viewData.user.questionnaire.questions;
      if ( ! questions ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorQuestionnaireMessage, type: 'error' }));
        return false;
      }
      var self = this;
      var valid = true;
      questions.forEach(function(question) {
        if ( ! question.response ) {
          self.add(self.NotificationMessage.create({ message: self.ErrorQuestionnaireMessage, type: 'error' }));
          valid = false;
        }
      });
      return valid;
    }
  ],

  actions: [
    {
      name: 'exit',
      code: function() {
        if ( this.position === this.views.length - 1 ) {
          this.logOut();
        } else {
          this.add(this.Popup.create().tag({ class: 'net.nanopay.onboarding.b2b.ui.SaveAndLogOutModal' }));
        }
      }
    },
    {
      name: 'save',
      isAvailable: function (position) {
        return ( position < this.views.length - 1 );
      },
      code: function() {
        this.saveProgress();
      }
    },
    {
      name: 'goBack',
      label: 'Back',
      isAvailable: function(position) {
        return ( position > 0 && position < this.views.length - 1 );
      },
      code: function(X) {
        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      isAvailable: function (position) {
        return ( position < this.views.length - 1 );
      },
      code: function() {
        // submit profile
        if ( this.position === this.views.length - 2 ) {
          this.submit();
          return;
        }

        // move to next screen
        if ( this.position < this.views.length - 1 ) {
          if ( this.position === 0 ) {
            // validate admin Info
            if ( ! this.validateAdminInfo() ) return;
          }
          if ( this.position === 1 ) {
            // validate Business Profile
            if ( ! this.validateBusinessProfile() ) return;
          }
          if ( this.position == 3) {
            // validate Questionnaire
            if ( ! this.validateQuestionnaire() ) return;
          }
          this.subStack.push(this.views[this.subStack.pos + 1].view);
        }
      }
    }
  ]
});
