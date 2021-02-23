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
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a single bank account',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.auth.User',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.model.PadCapture',
    'foam.nanos.auth.Address',
  ],

  imports: [
    'accountDAO as bankAccountDAO',
    'padCaptureDAO',
    'bankAccountVerification',
    'notify',
    'selectedAccount',
    'stack',
    'user',
    'userDAO',
    'validateAccountNumber',
    'validateAddress',
    'validateCity',
    'validateInstitutionNumber',
    'validatePostalCode',
    'validateStreetNumber',
    'validateTransitNumber'
  ],

  exports: [
    'verifyAmount'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: net.nanopay.ui.wizard.WizardView
        .getAxiomsByClass(foam.u2.CSS)[0].code
    })
  ],
  constants: {
    ADD_BANK_INFO_VIEW_ID: 'form-addBank-info',
    PAD_AUTH_VIEW_ID: 'form-addBank-pad',
    VERIFICATION_VIEW_ID: 'form-addBank-verification',
    DONE_ADDING_BANK_ID: 'form-addBank-done'
  },

  properties: [
    { name: 'newBankAccount' },
    { name: 'verifyAmount' },
    { name: 'userAddress' }
  ],

  messages: [
    { name: 'Accept', message: 'I Agree' },
    { name: 'Next', message: 'Next' },
    { name: 'Later', message: 'Come back later' },
    { name: 'Verify', message: 'Verify' },
    { name: 'Back', message: 'Back' },
    { name: 'Done', message: 'Done' }
  ],

  methods: [
    function init() {
      this.views = [
        {
          parent: 'addBank',
          id: this.ADD_BANK_INFO_VIEW_ID,
          label: 'Account info',
          view: {
            class: 'net.nanopay.cico.ui.bankAccount.form.BankInfoForm'
          }
        },
        {
          parent: 'addBank',
          id: this.PAD_AUTH_VIEW_ID,
          label: 'Pad Authorization',
          view: {
            class: 'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization'
          }
        },
        {
          parent: 'addBank',
          id: this.VERIFICATION_VIEW_ID,
          label: 'Verification',
          view: {
            class: 'net.nanopay.cico.ui.bankAccount.form.BankVerificationForm'
          }
        },
        {
          parent: 'addBank',
          id: this.DONE_ADDING_BANK_ID,
          label: 'Done',
          view: {
            class: 'net.nanopay.cico.ui.bankAccount.form.BankDoneForm'
          }
        }
      ];
      this.SUPER();
      this.viewData.user = this.user;
      this.viewData.bankAccounts = [];
      this.viewData.accountInfo = {};
    },
    function validate() {
      // only perform these validations if on 1st screen
      if ( this.position === 0 ) {
        return this.validateAccountInfo();
      }
      // Only perform these validations if on 2nd screen
      if ( this.position === 1 ) {
        return this.validatePADAuthInfo();
      }
      return true;
    },
    function validateAccountInfo() {
      var accountInfo = this.viewData.accountInfo;

      var validateRequiredFields = !! (accountInfo.name && accountInfo.name.trim() !== ''
        && accountInfo.transitNumber && accountInfo.transitNumber.trim() !== ''
        && accountInfo.accountNumber && accountInfo.accountNumber.trim() !== ''
        && accountInfo.institutionNumber && accountInfo.institutionNumber.trim() !== '');

      if ( ! validateRequiredFields ) {
        this.notify('Please fill out all necessary fields before proceeding.', '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( accountInfo.name.length > 70 ) {
        this.notify('Account name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateTransitNumber(accountInfo.transitNumber) ) {
        this.notify('Invalid transit number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateAccountNumber(accountInfo.accountNumber) ) {
        this.notify('Invalid account number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateInstitutionNumber(accountInfo.institutionNumber) ) {
        this.notify('Invalid institution number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      return true;
    },
    function validatePADAuthInfo() {
      var user = this.viewData.user;
      var bankAddress = this.viewData.bankAddress;
      // PAD (Pre-Authorized Debit) requires all users to have an address and at
      // times, some business users wouldn't have one. This checks if the user
      // has a normal `.address` and if they don't, uses their business address
      // instead.
      this.userAddress = user.address;

      if ( user.firstName.length > 70 ) {
        this.notify('First name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( user.lastName.length > 70 ) {
        this.notify('Last name cannot exceed 70 characters.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateStreetNumber(this.userAddress.streetNumber) && ! this.validateStreetNumber(bankAddress.streetNumber) ) {
        this.notify('Invalid street number.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateAddress(this.userAddress.streetName) && ! this.validateAddress(bankAddress.streetName) ) {
        this.notify('Invalid street name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validateCity(this.userAddress.city) && ! this.validateCity(bankAddress.city) ) {
        this.notify('Invalid city name.', '', this.LogLevel.ERROR, true);
        return false;
      }
      if ( ! this.validatePostalCode(this.userAddress.postalCode, this.userAddress.countryId) ) {
        this.notify('Invalid user postal code.', '', this.LogLevel.ERROR, true);
        return false;
      }

      if ( ! this.validatePostalCode(bankAddress.postalCode, bankAddress.countryId) ) {
        this.notify('Invalid bank postal code.', '', this.LogLevel.ERROR, true);
        return false;
      }

      return true;
    },
    function goToBankPadAuthorization(accountInfo) {
      // REVIEW: AccountRefactor - what type of bank account to create? - Joel, perhaps need a factory.
      var newAccount = this.CABankAccount.create({
        name: accountInfo.name,
        institutionNumber: accountInfo.institutionNumber, // setting this so institution is created if not preset already
        branchId: accountInfo.transitNumber, // branchId = transit number
        accountNumber: accountInfo.accountNumber,
        owner: this.user.id,
        address: accountInfo.bankAddress
      });

      if ( newAccount.errors_ ) {
        this.notify(newAccount.errors_[0][1], '', this.LogLevel.ERROR, true);
        return;
      }
      this.viewData.bankAccounts.push(newAccount);

      this.subStack.push(
        this.views.find((t) => t.id === this.PAD_AUTH_VIEW_ID).view);
    },
    async function goToBankVerificationForm() {
      var account = this.viewData.bankAccounts[0]; // doing this cause this view adds only one account at a time.
      account.address = this.userAddress;

      var user = this.viewData.user;
      var padCapture = this.PadCapture.create({
        firstName: user.firstName,
        lastName: user.lastName,
        userId: user.id,
        address: this.userAddress,
        agree1: this.viewData.agree1,
        agree2: this.viewData.agree2,
        agree3: this.viewData.agree3,
        institutionNumber: account.institutionNumber,
        branchId: account.branchId, // branchId = transit number
        accountNumber: account.accountNumber
      });
      try {
        await this.padCaptureDAO.put(padCapture);
        account.bankAddress = this.viewData.bankAddress;
        account = await this.bankAccountDAO.put(account);
      } catch (error) {
        this.notify(error.message, '', this.LogLevel.ERROR, true);
        return;
      }
      this.viewData.bankAccounts[0] = account; // updated account
      this.subStack.push(
        this.views.find((t) => t.id === this.VERIFICATION_VIEW_ID).view);
    },
    async function goToBankDoneForm() {
      var account;
      if ( this.BankAccount.isInstance(this.viewData.bankAccounts[0]) ) {
        account = this.viewData.bankAccounts[0];
      }
      if ( this.BankAccount.isInstance(this.selectedAccount) ) {
        account = this.selectedAccount;
      }
      try {
        var isVerified = await this.bankAccountVerification
          .verify(null, account.id, this.viewData.verificationAmount);
      } catch (error) {
        this.notify(error.message ? error.message : 'An error occurred while processing your request.', '', this.LogLevel.ERROR, true);
        return;
      }
      if ( isVerified ) {
        this.notify('Account successfully verified!', '', this.LogLevel.INFO, true);
        this.subStack.push(
          this.views.find((t) => t.id === this.DONE_ADDING_BANK_ID).view
        );
      }
    }
  ],

  actions: [
    {
      name: 'goBack',
      code: function(X) {
        var currentViewId = this.views[this.position].id;
        // only view that rolls back to the previous view
        if ( currentViewId === this.PAD_AUTH_VIEW_ID ) {
          this.subStack.back();
        } else {
          X.stack.back();
        }
      }
    },
    {
      name: 'goNext',
      code: function(X) {
        if ( ! this.validate() ) {
          return;
        }
        var currentViewId = this.views[this.position].id;
        switch ( currentViewId ) {
          case this.ADD_BANK_INFO_VIEW_ID:
            this.goToBankPadAuthorization(this.viewData.accountInfo);
            break;
          case this.PAD_AUTH_VIEW_ID:
            this.goToBankVerificationForm();
            break;
          case this.VERIFICATION_VIEW_ID:
            this.goToBankDoneForm();
            break;
          default:
            this.onComplete ? this.onComplete(this) : ctrl.stack.back();
        }
      }
    }
  ]
});
