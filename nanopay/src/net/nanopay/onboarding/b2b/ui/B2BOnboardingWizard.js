foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'B2BOnboardingWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Onboarding Wizard for new B2B users.',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup'
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

  messages: [
    { name: 'SaveSuccessfulMessage', message: 'Progress saved.' },
    { name: 'SaveFailureMessage', message: 'Could not save your changes. Please try again.' },
    { name: 'ErrorBusinessProfileNameMessage', message: 'Business name required.' },
    { name: 'ErrorBusinessProfilePhoneMessage', message: 'Invalid business phone number.' },
    { name: 'ErrorBusinessProfileTypeMessage', message: 'Business type required.' },
    { name: 'ErrorBusinessProfileRegistrationNumberMessage', message: 'Business registration number required.' },
    { name: 'ErrorBusinessProfileRegistrationAuthorityMessage', message: 'Business registration authority required.' },
    { name: 'ErrorBusinessProfileRegistrationDateMessage', message: 'Invalid business registration date.' },
    { name: 'ErrorBusinessProfileStreetNumberMessage', message: 'Invalid street number.' },
    { name: 'ErrorBusinessProfileStreetNameMessage', message: 'Invalid street name.' },
    { name: 'ErrorBusinessProfileCityMessage', message: 'Invalid city name.' },
    { name: 'ErrorBusinessProfilePostalCodeMessage', message: 'Invalid postal code.' }
  ],

  methods: [
    function init() {
      this.title = 'Registration';
      this.exitLabel = 'Log Out';
      this.viewData.user = this.user;
      this.views = [
        { parent: 'addB2BUser', id: 'form-addB2BUser-confirmAdminInfo', label: 'Confirm Admin Info', view: { class: 'net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-businessProfile', label: 'Business Profile', view: { class: 'net.nanopay.onboarding.b2b.ui.BusinessProfileForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-principalOwner', label: 'Principal Owner(s) Profile', view: { class: 'net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-questionnaire',  label: 'Questionnaire', view: { class: 'net.nanopay.onboarding.b2b.ui.QuestionnaireForm', id: 'b2b' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-reviewAndSubmit', label: 'Review and Submit', view: { class: 'net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm' } }
      ];
      this.SUPER();
    },

    function logOutHandler(selection) {
      switch(selection) {
        case 0 : this.logOut();
                 break;
        case 1 : this.saveProgress(true);
                 break;
        default: console.error('unhandled response');
      }
    },

    function saveProgress(andLogout) {
      var self = this;

      this.user = this.viewData.user;
      
      this.userDAO.put(this.user).then(function(updateduser) {
        self.add(self.NotificationMessage.create({ message: self.SaveSuccessfulMessage }));
        if ( andLogout ) self.logOut();
      }).catch(function(err){
        self.add(self.NotificationMessage.create({ message: self.SaveFailureMessage, type: 'error' }));
      });
    },

    function logOut() {
      var self = this;
      this.auth.logout().then(function() {
        self.window.location.hash = '';
        self.window.location.reload();
      });
    },

    function validateBusinessProfile() {
      var businessProfile = this.viewData;
      if ( ! businessProfile.businessName ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileNameMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validatePhone(businessProfile.businessPhoneNumber) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfilePhoneMessage, type: 'error' }));
        return false;
      }

      if ( ! businessProfile.businessType ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileTypeMessage, type: 'error' }));
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

      if ( ! this.validateStreetNumber(businessProfile.businessStreetNumber) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileStreetNumberMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validateAddress(businessProfile.businessStreetName) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileStreetNameMessage, type: 'error' }));
        return false;
      }

      if ( businessProfile.businessAddress2 && ! this.validateAddress(businessProfile.businessAddress2) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileStreetNameMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validateCity(businessProfile.businessCity) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfileCityMessage, type: 'error' }));
        return false;
      }

      if ( ! this.validatePostalCode(businessProfile.businessPostalCode) ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorBusinessProfilePostalCodeMessage, type: 'error' }));
        return false;
      }
      return true;
    }
  ],

  actions: [
    {
      name: 'exit',
      code: function() {
        this.add(this.Popup.create().tag({ class: 'net.nanopay.onboarding.b2b.ui.SaveAndLogOutModal' }));
      }
    },
    {
      name: 'save',
      code: function() {
        this.saveProgress();
      }
    },
    {
      name: 'goBack',
      label: 'Back',
      isAvailable: function(position) {
        return position > 0;
      },
      code: function(X) {
        this.subStack.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      isEnabled: function(position) {
        return position < this.views.length - 1;
      },
      code: function() {
        this.subStack.push(this.views[this.subStack.pos + 1].view);
      }
    }
  ]
});
