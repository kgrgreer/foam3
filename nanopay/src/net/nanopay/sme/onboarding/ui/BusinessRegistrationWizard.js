foam.CLASS({
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessRegistrationWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  implements: [
    'foam.mlang.Expressions'
  ],

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
    { name: 'SAVE_SUCCESSFUL_MESSAGE', message: 'Progress saved.' },
    { name: 'SAVE_FAILURE_MESSAGE', message: 'Could not save your changes. Please try again.' },
    { name: 'SUBMIT_SUCCESS_MESSAGE', message: 'Registration submitted successfully! You will receive a confirmation email in your mailbox' },
    { name: 'SUBMIT_FAILURE_MESSAGE', message: 'Registration submission failed. Please try again later.' },
    { name: 'ERROR_MISSING_FIELDS', message: 'Please fill out all necessary fields before proceeding.' },
    { name: 'ERROR_ADMIN_JOB_TITLE_MESSAGE', message: 'Job title required.' },
    { name: 'ERROR_ADMIN_NUMBER_MESSAGE', message: 'Invalid phone number.' },
    { name: 'ERROR_BUSINESS_PROFILE_NAME_MESSAGE', message: 'Business name required.' },
    { name: 'ERROR_BUSINESS_PROFILE_PHONE_MESSAGE', message: 'Invalid business phone number.' },
    { name: 'ERROR_BUSINESS_PROFILE_TYPE_MESSAGE', message: 'Business type required.' },
    { name: 'ERROR_BUSINESS_PROFILE_REGISTRATION_NUMBER_MESSAGE', message: 'Business registration number required.' },
    { name: 'ERROR_BUSINESS_PROFILE_REGISTRATION_AUTHORITY_MESSAGE_ERROR', message: 'Business registration authority required.' },
    { name: 'ERROR_BUSINESS_PROFILE_REGISTRATION_DATE_MESSAGE', message: 'Invalid business registration date.' },
    { name: 'ERROR_BUSINESS_PROFILE_STREET_NUMBER_MESSAGE', message: 'Invalid street number.' },
    { name: 'ERROR_BUSINESS_PROFILE_STREET_NAME_MESSAGE', message: 'Invalid street name.' },
    { name: 'ERROR_BUSINESS_PROFILE_CITY_MESSAGE', message: 'Invalid city name.' },
    { name: 'ERROR_BUSINESS_PROFILE_POSTAL_CODE_MESSAGE', message: 'Invalid postal code.' },
    { name: 'ERROR_QUESTIONNAIRE_MESSAGE', message: 'You must answer each question.' },
    { name: 'ERROR_FIRST_NAME_TOO_LONG', message: 'First name cannot exceed 70 characters.' },
    { name: 'ERROR_FIRST_NAME_DIGITS', message: 'First name cannot contain numbers.' },
    { name: 'ERROR_MIDDLE_NAME_TOO_LONG', message: 'Middle name cannot exceed 70 characters.' },
    { name: 'ERROR_MIDDLE_NAME_DIGITS', message: 'Middle name cannot contain numbers.' },
    { name: 'ERROR_LAST_NAME_TOO_LONG', message: 'Last name cannot exceed 70 characters.' },
    { name: 'ERROR_LAST_NAME_DIGITS', message: 'Last name cannot contain numbers.' },
    { name: 'ERROR_TERMS_AND_CONDITIONS_MESSAGE', message: 'Please accept the terms and conditions.' },
    { name: 'ERROR_BASE_CURRENCY_MESSAGE', message: 'Base currency required.' },
    { name: 'ERROR_ANNUAL_REVENUE_MESSAGE', message: 'Annual revenue required.' },
    { name: 'ERROR_INTERNATIONAL_PAYMENTS_MESSAGE', message: 'International payments required.' },
    { name: 'ERROR_TRANSACTION_PURPOSE_MESSAGE', message: 'Transaction purpose required.' },
    { name: 'ERROR_ANNUAL_TRANSACTION_MESSAGE', message: 'Annual transaction required.' },
    { name: 'ERROR_ANNUAL_VOLUME_MESSAGE', message: 'Annual volume required.' },
    {
      name: 'NON_SUCCESS_REGISTRATION_MESSAGE',
      message: `Your finished with the registration process. A signing officer
          of your company must complete the rest of the registration.`
    },
    {
      name: 'SUCCESS_REGISTRATION_MESSAGE',
      message: `Business profile completed. Admins can change profile information in Business Settings`
    }
  ],

  methods: [
    function init() {
      var self = this;
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
      this.viewData.user.suggestedUserTransactionInfo = this.user.suggestedUserTransactionInfo ?
          this.user.suggestedUserTransactionInfo : this.SuggestedUserTransactionInfo.create({});

      var principalOwnerDAO = foam.dao.ArrayDAO.create({ array: this.viewData.user.principalOwners, of: 'foam.nanos.auth.User' });
      principalOwnerDAO.find(this.EQ(this.User.SIGNING_OFFICER, true)).then(function(signingOfficer) {
        if ( signingOfficer ) {
          self.viewData.signingOfficer = signingOfficer;
          return;
        }
        self.viewData.signingOfficer = {};
        self.viewData.signingOfficer = self.User.create({});
        self.viewData.signingOfficer.phone = self.Phone.create({});
      });

      this.viewData.identification = {};
      this.SUPER();
    },
    function validateSigningOfficerInfo() {
      var editedUser = this.viewData.signingOfficer;

      if ( ! editedUser.firstName ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_MISSINGS_FIELDS, type: 'error' }));
        return false;
      }
      if ( editedUser.firstName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_FIRST_NAME_TOO_LONG, type: 'error' }));
        return false;
      }
      if ( /\d/.test(editedUser.firstName) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_FIRST_NAME_DIGITS, type: 'error' }));
        return false;
      }

      if ( ! editedUser.lastName ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_MISSING_FIELDS, type: 'error' }));
        return false;
      }
      if ( editedUser.lastName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_LAST_NAME_TOO_LONG, type: 'error' }));
        return false;
      }
      if ( /\d/.test(editedUser.lastName) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_LAST_NAME_DIGITS, type: 'error' }));
        return false;
      }

      if ( ! editedUser.jobTitle ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_ADMIN_JOB_TITLE_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! this.validatePhone(editedUser.phone.number) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_ADMIN_NUMBER_MESSAGE, type: 'error' }));
        return false;
      }
      return true;
    },

    function validateTransactionInfo() {
      var transactionInfo = this.viewData.user.suggestedUserTransactionInfo;

      if ( ! transactionInfo.baseCurrency ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_BASE_CURRENCY_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! transactionInfo.annualRevenue ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_ANNUAL_REVENUE_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! transactionInfo.internationalPayments ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_INTERNATIONAL_PAYMENTS_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! transactionInfo.transactionPurpose ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_TRANSACTION_PURPOSE_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! transactionInfo.annualTransactionAmount ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_ANNUAL_TRANSACTION_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! transactionInfo.annualVolume ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_ANNUAL_VOLUME_MESSAGE, type: 'error' }));
        return false;
      }

      return true;
    },

    function validateBusinessProfile() {
      var businessProfile = this.viewData.user;

      if ( ! businessProfile.organization ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_BUSINESS_PROFILE_NAME_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! this.validatePhone(businessProfile.businessPhone.number) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_BUSINESS_PROFILE_PHONE_MESSAGE, type: 'error' }));
        return false;
      }

      var businessAddress = businessProfile.businessAddress;
      if ( ! this.validateStreetNumber(businessAddress.streetNumber) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_BUSINESS_PROFILE_STREET_NUMBER_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! this.validateAddress(businessAddress.streetName) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_BUSINESS_PROFILE_STREET_NAME_MESSAGE, type: 'error' }));
        return false;
      }

      if ( businessAddress.suite && ! this.validateAddress(businessAddress.suite) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_BUSINESS_PROFILE_STREET_NAME_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! this.validateCity(businessAddress.city) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_BUSINESS_PROFILE_CITY_MESSAGE, type: 'error' }));
        return false;
      }

      if ( ! this.validatePostalCode(businessAddress.postalCode) ) {
        this.add(this.NotificationMessage.create({ message: this.ERROR_BUSINESS_PROFILE_POSTAL_CODE_MESSAGE, type: 'error' }));
        return false;
      }
      return true;
    },
    async function saveProgress(andLogout) {
      var self = this;
      this.user = this.viewData.user;

      this.userDAO.put(this.user).then(function(result) {
        if ( ! result ) throw new Error(self.SaveFailureMessage);
        self.user.copyFrom(result);
        self.add(self.NotificationMessage.create({ message: self.SAVE_SUCCESSFUL_MESSAGE }));
        self.stack.back();
      }).catch(function(err) {
        self.add(self.NotificationMessage.create({ message: self.SAVE_FAILURE_MESSAGE, type: 'error' }));
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
        return ( position < this.views.length );
      },
      code: function() {
        var self = this;

        // move to next screen
        if ( this.position < this.views.length ) {
          if ( this.position === 1 ) {
            // validate Business Profile
            if ( ! this.validateBusinessProfile() ) return;
          }
          if ( this.position === 2 ) {
            // validate transaction info
            if ( ! this.validateTransactionInfo() ) return;
          }
          if ( this.position === 3 ) {
            // validate principal owner or push stack back to complete registration.
            if ( this.viewData.user.signingOfficer ) {
              if ( ! this.validateSigningOfficerInfo() ) return;
              var principalOwnersDAO = foam.dao.ArrayDAO.create({ array: this.user.principalOwners, of: 'foam.nanos.auth.User' });
              principalOwnersDAO.put(this.viewData.signingOfficer);
              principalOwnersDAO.select().then(function(principalOwners) {
                self.viewData.user.principalOwners = principalOwners.array;
              });
            } else {
              ctrl.add(this.NotificationMessage.create({ message: this.SUCCESS_REGISTRATION_MESSAGE }));
              this.saveProgress();
              this.stack.back();
            }
          }
          if ( this.position === 4 ) {
            ctrl.add(this.NotificationMessage.create({ message: this.SUCCESS_REGISTRATION_MESSAGE }));
            this.user.onboarded = true;
            this.saveProgress();
            this.stack.back();
            return;
          }

          this.subStack.push(this.views[this.subStack.pos + 1].view);
        }
      }
    }
  ]
});
