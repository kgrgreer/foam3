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
  package: 'net.nanopay.sme.onboarding.ui',
  name: 'BusinessRegistrationWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.BeneficialOwner',
    'net.nanopay.model.BusinessUserJunction',
    'net.nanopay.sme.onboarding.model.SuggestedUserTransactionInfo'
  ],

  imports: [
    'subject',
    'bannerizeCompliance',
    'businessDAO',
    'ctrl',
    'notify',
    'pushMenu',
    'signingOfficerJunctionDAO',
    'stack',
    'user',
    'userDAO',
    'validateAddress',
    'validateAge',
    'validateCity',
    'validateEmail',
    'validatePhone',
    'validatePostalCode',
    'validateStreetNumber'
  ],

  exports: [
    'beneficialOwnersDAO',
    'isSigningOfficer',
    'validateBeneficialOwner'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
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
      background: /*%GREY5%*/ #f5f7fa;
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
    ^ .foam-u2-ActionView-goNext {
      border-radius: 4px !important;
      box-shadow: 0 1px 0 0 rgba(22, 29, 37, 0.05);
      background-color: #604aff !important;
    }
    ^ .stackColumn {
      display: inline-block;
      width: calc(100% - 300px);
      height: calc(100% - 65px);
      box-sizing: border-box;
      position: relative;
      top: -20px;
      overflow-y: auto;
      vertical-align: top;
      -ms-overflow-style: none;  // IE 10+
      overflow: -moz-scrollbars-none;  // Firefox
    }
    ^ .stackColumn::-webkit-scrollbar {
      display: none;  // Safari and Chrome
    }
    ^ .title {
      font-size: 32px;
      line-height: 48px;
      font-weight: 900;
    }
    ^ .foam-u2-view-RadioView {
      margin-left: 50px;
    }
    ^ .foam-u2-ActionView-uploadButton {
      background: #604aff !important;
    }
  `,

  properties: [
    {
      name: 'beneficialOwnersDAO',
      factory: function() {
        return this.user.beneficialOwners;
      }
    },
    {
      type: 'Boolean',
      name: 'isSigningOfficer',
      documentation: `
        This gets set in the 'init' method below after a promise resolves. It
        will be set to true if the agent in the context is a signing officer for
        the business (which is the user in the context).
      `
    },
    {
      type: 'Boolean',
      name: 'hasExitOption',
      expression: function(position) {
        return position === 0;
      }
    },
    {
      type: 'Boolean',
      name: 'hasBackOption',
      expression: function(position) {
        return position > 1;
      }
    },
    {
      type: 'Boolean',
      name: 'hasSaveOption',
      expression: function(position) {
        return position > 0;
      }
    },
    {
      type: 'String',
      name: 'saveLabel',
      factory: function() {
        return 'Save and Close';
      }
    }
  ],

  messages: [
    { name: 'SAVE_SUCCESSFUL_MESSAGE', message: 'Progress saved.' },
    { name: 'SAVE_FAILURE_MESSAGE', message: 'Could not save your changes. Please try again.' },
    { name: 'SUBMIT_SUCCESS_MESSAGE', message: 'Registration submitted successfully! You will receive a confirmation email in your mailbox.' },
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
    { name: 'ERROR_BUSINESS_PROFILE_STREET_2_NAME_MESSAGE', message: 'Address line 2 is invalid.' },
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
    { name: 'ERROR_ANNUAL_REVENUE_MESSAGE', message: 'Domestic Annual Gross Sales required.' },
    { name: 'ERROR_INTERNATIONAL_PAYMENTS_MESSAGE', message: 'International payments required.' },
    { name: 'ERROR_TRANSACTION_PURPOSE_MESSAGE', message: 'Transaction purpose required.' },
    { name: 'ERROR_OTHER_TRANSACTION_PURPOSE_MESSAGE', message: 'Please provide additional information for your transaction purpose.' },
    { name: 'ERROR_ANNUAL_TRANSACTION_MESSAGE', message: 'Annual Number of Transactions is required.' },
    { name: 'ERROR_ANNUAL_VOLUME_MESSAGE', message: 'Domestic Estimated Annual Volume required.' },
    { name: 'ERROR_ANNUAL_VOLUME_CAD', message: 'Domestic Estimated Annual Volume required.' },
    { name: 'ERROR_TAX_ID_REQUIRED', message: 'Tax Identification Number is required.' },
    { name: 'ERROR_TAX_ID_INVALID', message: 'Tax Identification Number should be 9 digits.' },
    { name: 'ERROR_ID_EXPIRED', message: 'Identification expiry date indicates that the ID is expired.' },
    { name: 'ERROR_ADD_BUSINESS_DOCS', message: 'Please upload at least one proof of registration file for your business type.' },
    { name: 'ERROR_ADD_SIGNING_DOCS', message: 'Please upload at least one identification file for the signing officer.' },
    { name: 'ERROR_NO_BENEFICIAL_OWNERS', message: 'Please add a beneficial owner to continue, if you have none then please select either of the checkboxes at the top of the page.' },
    { name: 'ERROR_TERMS_NOT_CHECKED_1', message: 'Please agree to the Tri-Party Agreement for Ablii Payment Services - Canada by clicking on the checkbox.' },
    { name: 'ERROR_TERMS_NOT_CHECKED_2', message: 'Please agree to the Dual Party Agreement for Ablii Payment Services by clicking on the checkbox.' },
    { name: 'ERROR_TERMS_NOT_CHECKED_3', message: 'Please agree to the Tri-Party Agreement for Ablii Payment Services - United States by clicking on the checkbox.' },
    { name: 'ERROR_MISSING_BUSINESS_TYPE', message: 'Type of Business is required.' },
    { name: 'ERROR_MISSING_NATURE_OF_BUSINESS', message: 'Nature of Business is required.' },
    { name: 'ERROR_MISSING_TARGET_CUSTOMERS', message: 'You must specify who you market your services and products to.' },
    { name: 'ERROR_MISSING_SOURCE_OF_FUNDS', message: 'You must specify your source of funds.' },
    { name: 'ERROR_MISSING_FIRST_PAYMENT_DATE', message: 'Anticipated First Payment Date is required.' },
    { name: 'ERROR_PHONE_LENGTH', message: 'Phone number cannot exceed 10 digits in length' },
    { name: 'ERROR_NO_ADDITIONAL_BENEFICIAL_OWNERS', message: 'You must acknowledge that the profile contains details of all beneficial owners of the business.' },
    { name: 'FIRST_NAME_ERROR', message: 'First and last name fields must be populated.' },
    { name: 'JOB_TITLE_ERROR', message: 'Job title field must be populated.' },
    { name: 'BIRTHDAY_ERROR', message: 'Please Enter Valid Birthday yyyy-mm-dd.' },
    { name: 'BIRTHDAY_ERROR_2', message: 'Beneficial owner must be at least 16 years of age.' },
    { name: 'ADDRESS_STREET_NUMBER_ERROR', message: 'Invalid street number.' },
    { name: 'ADDRESS_STREET_NAME_ERROR', message: 'Invalid street name.' },
    { name: 'ADDRESS_LINE_ERROR', message: 'Invalid address line.' },
    { name: 'ADDRESS_CITY_ERROR', message: 'Invalid city name.' },
    { name: 'ADDRESS_POSTAL_CODE_ERROR', message: 'Invalid postal code.' },
    { name: 'OWNER_PERCENT_ERROR', message: 'Please enter a valid percentage of ownership for the adding Owner. (Must be between 1-100%)' },
    {
      name: 'NON_SUCCESS_REGISTRATION_MESSAGE',
      message: `Your finished with the registration process. A signing officer
          of your company must complete the rest of the registration.`
    },
    {
      name: 'SUCCESS_REGISTRATION_MESSAGE',
      message: `Business profile completed.`
    }
  ],

  methods: [
    function init() {
      this.viewData.user = this.user;
      this.viewData.agent = this.subject.realUser;
      this.title = 'Your business profile';

      this.user.signingOfficers.dao
        .find(this.subject.realUser.id)
        .then((result) => {
          this.isSigningOfficer = result != null;
        });

      this.exitLabel = 'Close';
      this.nextLabel = 'Get started';

      this.views = [
        { id: 'business-registration-introduction', label: 'Getting Started', subtitle: 'Additional information', view: { class: 'net.nanopay.sme.onboarding.ui.IntroductionView' }, isHiddenInOverview: true },
        { id: 'business-registration-business-form', label: 'Your Business', view: { class: 'net.nanopay.sme.onboarding.ui.BusinessForm' } },
        { id: 'business-registration-transaction-estimate-form', label: 'Your Transactions', view: { class: 'net.nanopay.sme.onboarding.ui.UserTransactionEstimateForm' } },
        { id: 'business-registration-signing-officer-form', label: 'Signing Officer', view: { class: 'net.nanopay.sme.onboarding.ui.SigningOfficerForm' } },
        { id: 'business-registration-beneficial-owner-form', label: 'Beneficial Ownership', view: { class: 'net.nanopay.sme.onboarding.ui.BeneficialOwnershipForm' } }
      ];
      this.viewData.user.suggestedUserTransactionInfo =
        this.user.suggestedUserTransactionInfo ?
          this.user.suggestedUserTransactionInfo :
          this.SuggestedUserTransactionInfo.create({});

      this.viewData.beneficialOwner = {};
      this.SUPER();
    },

    /**
     * Validation for the third step of the wizard.
     */
    function validateSigningOfficerInfo() {
      var editedUser = this.viewData.agent;
      var currentDate = new Date();

      if ( ! editedUser.firstName ) {
        this.notify(this.ERROR_MISSINGS_FIELDS, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( editedUser.firstName.length > 70 ) {
        this.notify(this.ERROR_FIRST_NAME_TOO_LONG, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( /\d/.test(editedUser.firstName) ) {
        this.notify(this.ERROR_FIRST_NAME_DIGITS, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! editedUser.lastName ) {
        this.notify(this.ERROR_MISSING_FIELDS, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( editedUser.lastName.length > 70 ) {
        this.notify(this.ERROR_LAST_NAME_TOO_LONG, '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( /\d/.test(editedUser.lastName) ) {
        this.notify(this.ERROR_LAST_NAME_DIGITS, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! editedUser.jobTitle || ! editedUser.jobTitle.trim() ) {
        this.notify(this.ERROR_ADMIN_JOB_TITLE_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validatePhone(editedUser.phoneNumber) ) {
        this.notify(this.ERROR_ADMIN_NUMBER_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( editedUser.phoneNumber.length > 10 ) {
        this.notify(this.ERROR_PHONE_LENGTH, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! (editedUser.birthday instanceof Date && ! isNaN(editedUser.birthday.getTime())) ) {
        this.notify(this.BIRTHDAY_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validateAge(editedUser.birthday) ) {
        this.notify(this.BIRTHDAY_ERROR_2, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( editedUser.address.errors_ ) {
        this.notify(editedUser.address.errors_[0][1], '', this.LogLevel.ERROR, true);
        return false;
      }

      // editedUser.identification.validate();
      // if ( editedUser.identification.errors_ ) {
      //   this.notify(editedUser.identification.errors_[0][1], 'error');
      //   return false;
      // }

      // if ( editedUser.identification.expirationDate <= currentDate ) {
      //   this.notify(this.ERROR_ID_EXPIRED, 'error');
      //   return false;
      // }

      // if ( editedUser.additionalDocuments.length <= 0 ) {
      //   this.notify(this.ERROR_ADD_SIGNING_DOCS, 'error');
      //   return false;
      // }

      if ( foam.util.equals(this.viewData.user.address.countryId, 'CA') ) {
        // if ( ! this.viewData.canadianScrollBoxOne ) {
        //   this.notify(this.ERROR_TERMS_NOT_CHECKED_1, 'error');
        //   return false;
        // }
        if ( ! this.viewData.canadianScrollBoxTwo ) {
          this.notify(this.ERROR_TERMS_NOT_CHECKED_2, '', this.LogLevel.ERROR, true);
          return false;
        }
      }
      // NOTE: AFX RELATED, REMOVING FOR MVP RELEASE
      //
      // } else {
      //   if ( ! this.viewData.americanScrollBox ) {
      //     this.notify(this.ERROR_TERMS_NOT_CHECKED_3, 'error');
      //     return false;
      //   }
      // }

      return true;
    },

    /**
     * Validation for the second step of the wizard.
     */
    function validateTransactionInfo() {
      var transactionInfo = this.viewData.user.suggestedUserTransactionInfo;

      if ( ! transactionInfo.baseCurrency ) {
        this.notify(this.ERROR_BASE_CURRENCY_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! transactionInfo.transactionPurpose ) {
        this.notify(this.ERROR_TRANSACTION_PURPOSE_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( transactionInfo.transactionPurpose === 'Other' &&
        ! transactionInfo.otherTransactionPurpose ) {
        this.notify(this.ERROR_OTHER_TRANSACTION_PURPOSE_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! transactionInfo.annualRevenue ) {
        this.notify(this.ERROR_ANNUAL_REVENUE_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( transactionInfo.internationalPayments ) {
        if ( ! transactionInfo.annualTransactionAmount ) {
          this.notify(this.ERROR_ANNUAL_TRANSACTION_MESSAGE, '', this.LogLevel.ERROR, true);
          return false;
        }
      }
      
      if ( ! transactionInfo.annualDomesticTransactionAmount ) {
        this.notify(this.ERROR_ANNUAL_TRANSACTION_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! transactionInfo.annualDomesticVolume ) {
        this.notify(this.ERROR_ANNUAL_VOLUME_CAD, '', this.LogLevel.ERROR, true);
        return false;
      }

      // AFX RELATED - international payment
      // if ( transactionInfo.internationalPayments ) {
      //   if ( ! transactionInfo.annualTransactionAmount ) {
      //     this.notify(this.ERROR_ANNUAL_TRANSACTION_MESSAGE, 'error');
      //     return false;
      //   }

      //   if ( ! transactionInfo.annualVolume ) {
      //     this.notify(this.ERROR_ANNUAL_VOLUME_MESSAGE, 'error');
      //     return false;
      //   }

      //   if ( ! transactionInfo.firstTradeDate ) {
      //     this.notify(this.ERROR_MISSING_FIRST_PAYMENT_DATE, 'error');
      //     return false;
      //   }
      // }

      return true;
    },

    /**
     * Validation for the first step of the wizard.
     */
    function validateBusinessProfile() {
      var businessProfile = this.viewData.user;
      var businessAddress = businessProfile.address;

      if ( businessAddress.errors_ ) {
        this.notify(businessAddress.errors_[0][1], '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validatePhone(businessProfile.phoneNumber) ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_PHONE_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( businessProfile.phoneNumber.length > 10 ) {
        this.notify(this.ERROR_PHONE_LENGTH, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( businessProfile.businessTypeId == null ) {
        this.notify(this.ERROR_MISSING_BUSINESS_TYPE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! businessProfile.businessSectorId ) {
        this.notify(this.ERROR_MISSING_NATURE_OF_BUSINESS, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! businessProfile.organization
        || ! businessProfile.organization.trim() ) {
        this.notify(this.ERROR_BUSINESS_PROFILE_NAME_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! businessProfile.targetCustomers
        || ! businessProfile.targetCustomers.trim() ) {
        this.notify(this.ERROR_MISSING_TARGET_CUSTOMERS, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! businessProfile.sourceOfFunds
        || ! businessProfile.sourceOfFunds.trim()
        || businessProfile.sourceOfFunds === 'Other'
        && ( ! this.viewData.sourceOfFundsOther || ! this.viewData.sourceOfFundsOther.trim()) ) {
        this.notify(this.ERROR_MISSING_SOURCE_OF_FUNDS, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( businessProfile.address.countryId === 'US' ) {
        if ( ! businessProfile.taxIdentificationNumber ) {
          this.notify(this.ERROR_TAX_ID_REQUIRED, '', this.LogLevel.ERROR, true);
          return false;
        }
        if ( businessProfile.taxIdentificationNumber.length !== 9 ) {
          this.notify(this.ERROR_TAX_ID_INVALID, '', this.LogLevel.ERROR, true);
          return false;
        }
      }

      // if ( businessProfile.additionalDocuments.length <= 0 ) {
      //   this.notify(this.ERROR_ADD_BUSINESS_DOCS, 'error');
      //   return false;
      // }

      return true;
    },

    /**
     * Validation for the fourth step of the wizard.
     */
    function validateBeneficialOwner(beneficialOwner) {
      if ( ! beneficialOwner.ownershipPercent ||
        beneficialOwner.ownershipPercent <= 0 ||
        beneficialOwner.ownershipPercent > 100 ) {
          this.notify(this.OWNER_PERCENT_ERROR, '', this.LogLevel.ERROR, true);
          return false;
      }

      if ( ! beneficialOwner.firstName || ! beneficialOwner.lastName ) {
        this.notify(this.FIRST_NAME_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! beneficialOwner.jobTitle || ! beneficialOwner.jobTitle.trim() ) {
        this.notify(this.JOB_TITLE_ERROR, '', this.LogLevel.ERROR, true);
        return false;
      }
      // By pass for safari & mozilla type='date' on input support
      // Operator checking if dueDate is a date object if not, makes it so or throws notification.
      if ( isNaN(beneficialOwner.birthday) && beneficialOwner.birthday != null ) {
        this.notify(this.BIRTHDAY_ERROR, '', this.LogLevel.ERROR, true);
        return;
      }
      if ( ! this.validateAge(beneficialOwner.birthday) ) {
        this.notify(this.BIRTHDAY_ERROR_2, '', this.LogLevel.ERROR, true);
        return false;
      }

      var address = beneficialOwner.address;
      if ( address.errors_ ) {
        this.notify(address.errors_[0][1], '', this.LogLevel.ERROR, true);
        return false;
      }

      return true;
    },

    async function validateBeneficialOwners() {
      var beneficialOwnersCount = await this.viewData.user.beneficialOwners
        .select(this.COUNT());
      if ( ! this.viewData.noBeneficialOwners
        && ! this.viewData.publiclyTradedEntity ) {
        if ( beneficialOwnersCount.value <= 0 ) {
          return false;
        }
      }
      return true;
    },

    function isFillingBeneficialOwnerForm(beneficialOwner) {
      return beneficialOwner.firstName ||
           beneficialOwner.lastName ||
           beneficialOwner.jobTitle ||
           beneficialOwner.birthday ||
           beneficialOwner.address.streetName;
    },

    async function saveBusiness() {
      this.user = this.viewData.user;
      try {
        var result = await this.businessDAO.put(this.user);
        this.user.copyFrom(result);
        this.viewData.user = this.user;
      } catch (err) {
        console.error(err);
        this.notify(this.SAVE_FAILURE_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },

    async function saveAgent() {
      this.subject.realUser = this.viewData.agent;
      try {
        var result = await this.userDAO.put(this.subject.realUser);
        this.subject.realUser.copyFrom(result);
        this.viewData.agent = this.subject.realUser;
      } catch (exp) {
        this.notify(this.SAVE_FAILURE_MESSAGE, '', this.LogLevel.ERROR, true);
        return false;
      }

      return true;
    },

    async function saveProgress(andLogout) {
      var isSaved;
      if ( this.position === 3 ) {
        isSaved = await this.saveAgent();
      } else {
        isSaved = await this.saveBusiness();
      }
      if ( isSaved ) {
        this.notify(this.SAVE_SUCCESSFUL_MESSAGE, '', this.LogLevel.INFO, true);
        this.stack.back();
      } else {
        this.notify(this.SAVE_FAILURE_MESSAGE, '', this.LogLevel.ERROR, true);
      }
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
      code: async function() {
        // move to next screen
        if ( this.position < this.views.length ) {
          if ( this.position === 1 ) {
            // validate Business Profile
            if ( ! this.validateBusinessProfile() ) return;
            var isSaved = await this.saveBusiness();
            if ( ! isSaved ) {
              return;
            }
          }
          if ( this.position === 2 ) {
            // validate transaction info
            if ( ! this.validateTransactionInfo() ) return;
            var isSaved = await this.saveBusiness();
            if ( ! isSaved ) {
              return;
            }
          }
          if ( this.position === 3 ) {
            // validate beneficial owner or push stack back to complete registration.
            if ( this.isSigningOfficer ) {
              if ( ! this.validateSigningOfficerInfo() ) return;
              var isAgentSaved = await this.saveAgent();
              if ( ! isAgentSaved ) {
                return;
              }
            } else {
              // if not signing officer then exit wizard
              var isAgentSaved = await this.saveAgent();
              if ( isAgentSaved ) {
                this.notify(this.SUCCESS_REGISTRATION_MESSAGE, '', this.LogLevel.INFO, true);
                this.stack.back();
              }
              return;
            }
          }
          if ( this.position === 4 ) {
            if ( ! await this.validateBeneficialOwners() ) {
              this.notify(this.ERROR_NO_BENEFICIAL_OWNERS, '', this.LogLevel.ERROR, true);
              return;
            }

            if ( ! this.viewData.noAdditionalBeneficialOwners ) {
              this.notify(this.ERROR_NO_ADDITIONAL_BENEFICIAL_OWNERS, '', this.LogLevel.ERROR, true);
              return;
            }

            // validate beneficial owners info
            if ( this.isFillingBeneficialOwnerForm(this.viewData.beneficialOwner) ) {
              if ( this.validateBeneficialOwner(this.viewData.beneficialOwner) ) {
                try {
                  var beneficialOwner = this.BeneficialOwner.create({
                    id: this.viewData.beneficialOwner.id,
                    firstName: this.viewData.beneficialOwner.firstName,
                    lastName: this.viewData.beneficialOwner.lastName,
                    birthday: this.viewData.beneficialOwner.birthday,
                    address: this.viewData.beneficialOwner.address,
                    jobTitle: this.viewData.beneficialOwner.jobTitle
                  });
                  await this.beneficialOwnersDAO.put(beneficialOwner);
                } catch (err) {
                  this.notify(err ? err.message : this.BENEFICIAL_OWNER_FAILURE, '', this.LogLevel.ERROR, true);
                }
              } else {
                return;
              }
            }

            this.user.onboarded = true;
            this.user.compliance = this.ComplianceStatus.REQUESTED;
            this.ctrl.bannerizeCompliance();
            var isBusinessSaved = await this.saveBusiness();
            if ( isBusinessSaved ) {
              this.notify(this.SUCCESS_REGISTRATION_MESSAGE, '', this.LogLevel.INFO, true);
              this.pushMenu('sme.accountProfile.business-settings');
            }
            return;
          }

          this.subStack.push(this.views[this.subStack.pos + 1].view);
        }
      }
    }
  ]
});
