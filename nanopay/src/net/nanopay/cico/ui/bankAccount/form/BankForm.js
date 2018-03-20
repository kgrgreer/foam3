
foam.CLASS({
  package: 'net.nanopay.cico.ui.bankAccount.form',
  name: 'BankForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a bank account',

  requires: [
    'net.nanopay.model.BankAccount',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'bankAccountDAO',
    'bankAccountVerification',
    'selectedAccount',
    'stack',
    'user',
    'validateTransitNumber',
    'validateAccountNumber',
    'validateInstitutionNumber'
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

          var newAccount = this.BankAccount.create({
            accountName: accountInfo.accountName,
            institutionNumber: accountInfo.bankNumber,
            transitNumber: accountInfo.transitNumber,
            accountNumber: accountInfo.accountNumber,
            owner: this.user.id
          });

          if ( newAccount.errors_ ) {
            this.add(this.NotificationMessage.create({ message: newAccount.errors_[0][1], type: 'error' }));
            return;
          }
          self.subStack.push(self.views[self.subStack.pos + 1].view);
        }
        if ( this.position == 1 ) {
          // On Pad Verfication
          this.nextLabel = 'I Agree';
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

          if ( newAccount.errors_ ) {
            this.add(this.NotificationMessage.create({ message: newAccount.errors_[0][1], type: 'error' }));
            return;
          }

          this.bankAccountDAO.put(newAccount).then(function(response) {
            self.newBankAccount = response;
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.backLabel = 'Come back later';
            self.nextLabel = 'Verify';
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
          });
        }
        if ( this.position == 2 ) {
          // On Verification screen
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
