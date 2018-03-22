
foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a bank account',

  requires: [
    'foam.nanos.auth.User',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.model.BankAccount'
  ],

  imports: [
    'bankAccountDAO',
    'bankAccountVerification',
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
    'validateTransitNumber',
  ],

  exports: [
    'verifyAmount'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  properties: [
    {
      name: 'newBankAccount'
    },
    {
      name: 'verifyAmount'
    }
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addBank', id: 'form-addBank-info',         label: 'Account info',       view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankInfoForm' } },
        { parent: 'addBank', id: 'form-addBank-pad',          label: 'Pad Authorization',  view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankPadAuthorization' } },
        { parent: 'addBank', id: 'form-addBank-verification', label: 'Verification',       view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankVerificationForm' } },
        { parent: 'addBank', id: 'form-addBank-done',         label: 'Done',               view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankDoneForm' } }
      ];
      this.nextLabel = 'Next';
      this.SUPER();
      this.viewData.user = this.user
      this.viewData.bankAccount = []
    },
    function validations() {
      var accountInfo = this.viewData;

      if ( accountInfo.accountName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Account name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( ! this.validateTransitNumber(accountInfo.transitNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid transit number.', type: 'error' }));
        return false;
      }
      if ( ! this.validateAccountNumber(accountInfo.accountNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid account number.', type: 'error' }));
        return false;
      }
      if ( ! this.validateInstitutionNumber(accountInfo.bankNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid institution number.', type: 'error' }));
        return false;
      }
      if ( this.viewData.user.firstName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'First name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( this.viewData.user.lastName.length > 70 ) {
        this.add(this.NotificationMessage.create({ message: 'Last name cannot exceed 70 characters.', type: 'error' }));
        return false;
      }
      if ( ! this.validateStreetNumber(this.viewData.user.address.streetNumber) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street number.', type: 'error' }));
        return false;
      }
      if ( ! this.validateAddress(this.viewData.user.address.streetName) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid street name.', type: 'error' }));
        return false;
      }
      if ( ! this.validateCity(this.viewData.user.address.city) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid city name.', type: 'error' }));
        return false;
      }
      if ( ! this.validatePostalCode(this.viewData.user.address.postalCode) ) {
        this.add(this.NotificationMessage.create({ message: 'Invalid postal code.', type: 'error' }));
        return false;
      }
      return true;
    }
  ],

  actions: [
    {
      name: 'goBack',
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView' });
      }
    },
    {
      name: 'goNext',
      code: function() {
        var self = this;
        if ( this.position == 0 ) { 
          // On Submission screen.
          this.nextLabel = 'Next';
          // data from form
          var accountInfo = this.viewData;

          if ( ( accountInfo.accountName == null || accountInfo.accountName.trim() == '' ) ||
          ( accountInfo.transitNumber == null || accountInfo.transitNumber.trim() == '' ) ||
          ( accountInfo.accountNumber == null || accountInfo.accountNumber.trim() == '' ) ||
           accountInfo.bankNumber == null || accountInfo.bankNumber.trim() == '' ) {
            this.add(this.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
            return;
          }

          if ( ! this.validations() ) {
            return;
          }

          this.viewData.bankAccount.push( this.BankAccount.create({
            accountName: accountInfo.accountName,
            institutionNumber: accountInfo.bankNumber,
            transitNumber: accountInfo.transitNumber,
            accountNumber: accountInfo.accountNumber,
            owner: this.user.id
          }));

          if ( this.viewData.bankAccount.errors_ ) {
            this.add(this.NotificationMessage.create({ message: this.viewData.bankAccount.errors_[0][1], type: 'error' }));
            return;
          }
          self.subStack.push(self.views[self.subStack.pos + 1].view);
          return;
        }
        if ( this.position == 1 ) {
          // On Pad Verfication
          this.nextLabel = 'I Agree';
          var accountInfo = this.viewData.bankAccount;

          if ( ! this.validations() ) {
            return;
          }

          if ( accountInfo.errors_ ) {
            this.add(this.NotificationMessage.create({ message: accountInfo.errors_[0][1], type: 'error' }));
            return;
          }
          this.userDAO.put(this.viewData.user).then(function (result) {
            self.viewData.user.copyFrom(result);
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
          });
          this.bankAccountDAO.put(accountInfo).then(function(response) {
            self.viewData.bankAccount = response;
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.backLabel = 'Come back later';
            self.nextLabel = 'Verify';
            return;
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
          });
        }
        if ( this.position == 2 ) {
          // On Verification screen
          self.add(self.NotificationMessage.create({ message: 'BOOM', type: '' }));
          if ( this.selectedAccount != undefined || this.selectedAccount != null ) {
            this.newBankAccount = this.selectedAccount;
          }

          this.bankAccountVerification.verify(this.newBankAccount.id, this.verifyAmount).then(function(response) {
            if ( response ) {
              self.add(self.NotificationMessage.create({ message: 'Account successfully verified!', type: '' }));
              self.subStack.push(self.views[self.subStack.pos + 1].view);
              self.backLabel = 'Back';
              self.nextLabel = 'Done';
            }
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
          });
        }

        if ( this.subStack.pos == this.views.length - 1 ) { // If last page
          return this.stack.push({ class: 'net.nanopay.cico.ui.bankAccount.BankAccountsView' });
        }
      }
    }
  ]
});
