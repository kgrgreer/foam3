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
  name: 'B2BOnboardingWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Onboarding Wizard for new B2B users.',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.dialog.Popup',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.AccountStatus',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  imports: [
    'stack',
    'auth',
    'notify',
    'window',
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

  exports: [
    'logOutHandler'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  properties: [
    {
      class: 'String',
      name: 'nextLabel',
      expression: function(position) {
        return ( position < this.views.length - 2 ) ? 'Next' : 'Submit';
      }
    },
    'addPrincipalOwnersForm'
  ],

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
      var self = this;
      this.hasSaveOption = true;
      this.hasExitOption = true;
      this.hasNextOption = this.user.status === this.AccountStatus.PENDING;

      this.title = 'Registration';
      this.exitLabel = 'Log Out';
      this.viewData.user = this.user;
      this.views = [
        { parent: 'addB2BUser', id: 'form-addB2BUser-confirmAdminInfo', label: 'Confirm Admin Info', view: { class: 'net.nanopay.onboarding.b2b.ui.ConfirmAdminInfoForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-businessProfile', label: 'Business Profile', view: { class: 'net.nanopay.onboarding.b2b.ui.BusinessProfileForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-principalOwner', label: 'Principal Owner(s) Profile', view: { class: 'net.nanopay.onboarding.b2b.ui.AddPrincipalOwnersForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-questionnaire', label: 'Questionnaire', view: { class: 'net.nanopay.onboarding.b2b.ui.QuestionnaireForm', id: 'b2b' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-reviewAndSubmit', label: 'Review and Submit', view: { class: 'net.nanopay.onboarding.b2b.ui.ReviewAndSubmitForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-profileSubmitted', label: this.user.status$.map(function(status) {
          switch ( status ) {
            case self.AccountStatus.ACTIVE:
              return 'Registration has been approved.';
            case self.AccountStatus.DISABLED:
              return 'Registration is temporarily disabled.';
            default:
              return 'Registration is under review.';
          }
        }), hidden: true, view: { class: 'net.nanopay.onboarding.b2b.ui.ProfileSubmittedForm' } },
        { parent: 'addB2BUser', id: 'form-addB2BUser-changePassword', label: 'Registration has been approved.', view: { class: 'net.nanopay.onboarding.b2b.ui.PasswordChangeForm' }, hidden: true }
      ];
      this.SUPER();
    },

    function logOutHandler(selection) {
      switch ( selection ) {
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
        self.notify(self.SaveSuccessfulMessage, '', self.LogLevel.INFO, true);
        if ( andLogout ) self.logOut();
      }).catch(function(err) {
        self.notify(self.SaveFailureMessage, '', self.LogLevel.ERROR, true);
      });
    },

    function submit() {
      var self = this;

      this.user = this.viewData.user;
      this.user.status = this.AccountStatus.SUBMITTED;
      this.user.compliance = this.ComplianceStatus.REQUESTED;

      this.userDAO.put(this.user).then(function(result) {
        if ( ! result ) throw new Error(self.SubmitFailureMessage);
        self.user.copyFrom(result);
        self.notify(self.SubmitSuccessMessage, '', self.LogLevel.INFO, true);
        // self.subStack.push(self.views[self.subStack.pos + 1].view);
      }).catch(function(err) {
        self.notify(self.SubmitFailureMessage, '', self.LogLevel.ERROR, true);
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
      if ( ! editedUser.firstName ) {
        this.notify(this.ErrorMissingFields, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( editedUser.firstName.length > 70 ) {
        this.notify(this.ErrorFirstNameTooLong, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( /\d/.test(editedUser.firstName) ) {
        this.notify(this.ErrorFirstNameDigits, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( editedUser.middleName ) {
        if ( editedUser.middleName.length > 70 ) {
          this.notify(this.ErrorMiddleNameTooLong, '', this.LogLevel.ERROR, true);
          return false;
        }

        if ( /\d/.test(editedUser.middleName) ) {
          this.notify(this.ErrorMiddleNameDigits, '', this.LogLevel.ERROR, true);
          return false;
        }
      }

      if ( ! editedUser.lastName ) {
        this.notify(this.ErrorMissingFields, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( editedUser.lastName.length > 70 ) {
        this.notify(this.ErrorLastNameTooLong, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( /\d/.test(editedUser.lastName) ) {
        this.notify(this.ErrorLastNameDigits, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! editedUser.jobTitle ) {
        this.notify(this.ErrorAdminJobTitleMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validatePhone(editedUser.phoneNumber) ) {
        this.notify(this.ErrorAdminNumberMessage, '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },

    function validateBusinessProfile() {
      var businessProfile = this.viewData.user;
      if ( ! businessProfile.businessName ) {
        this.notify(this.ErrorBusinessProfileNameMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validatePhone(businessProfile.phoneNumber) ) {
        this.notify(this.ErrorBusinessProfilePhoneMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! businessProfile.businessRegistrationNumber ) {
        this.notify(this.ErrorBusinessProfileRegistrationNumberMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! businessProfile.businessRegistrationAuthority ) {
        this.notify(this.ErrorBusinessProfileRegistrationAuthorityMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      // By pass for safari & mozilla type='date' on input support
      // Operator checking if dueDate is a date object if not, makes it so or throws notification.
      if ( isNaN(businessProfile.businessRegistrationDate) && businessProfile.businessRegistrationDate != null ) {
        this.notify('Please enter valid registration date yyyy-mm-dd.', '', this.LogLevel.ERROR, true);
        return;
      }

      if ( ! businessProfile.businessRegistrationDate || businessProfile.businessRegistrationDate > new Date() ) {
        this.notify(this.ErrorBusinessProfileRegistrationDateMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      var businessAddress = businessProfile.address;
      if ( ! this.validateStreetNumber(businessAddress.streetNumber) ) {
        this.notify(this.ErrorBusinessProfileStreetNumberMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validateAddress(businessAddress.streetName) ) {
        this.notify(this.ErrorBusinessProfileStreetNameMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( businessAddress.suite && ! this.validateAddress(businessAddress.suite) ) {
        this.notify(this.ErrorBusinessProfileStreetNameMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validateCity(businessAddress.city) ) {
        this.notify(this.ErrorBusinessProfileCityMessage, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validatePostalCode(businessAddress.postalCode, businessAddress.countryId) ) {
        this.notify(this.ErrorBusinessProfilePostalCodeMessage, '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },

    function validateQuestionnaire() {
      var questions = this.viewData.user.questionnaire.questions;
      if ( ! questions ) {
        this.notify(this.ErrorQuestionnaireMessage, '', this.LogLevel.ERROR, true);
        return false;
      }
      var self = this;
      var valid = true;
      questions.forEach(function(question) {
        if ( ! question.response ) {
          self.notify(self.ErrorQuestionnaireMessage, '', self.LogLevel.ERROR, true);
          valid = false;
        }
      });
      return valid;
    },

    function validateTermAndCondition() {
      var valid = true;
      var checkBox = document.getElementsByClassName('foam-u2-md-CheckBox')[0];
      if ( checkBox.checked === false ) {
        this.notify(this.ErrorTermsAndConditionsMessage, '', this.LogLevel.ERROR, true);
        valid = false;
      }
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
      isAvailable: function(position) {
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
      isAvailable: function(position) {
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
