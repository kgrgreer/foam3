
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
    'user'
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
        { parent: 'addBank', id: 'form-addBank-info',         label: 'Account info',  view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankInfoForm' } },
        { parent: 'addBank', id: 'form-addBank-verification', label: 'Verification',  view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankVerificationForm' } },
        { parent: 'addBank', id: 'form-addBank-done',         label: 'Done',          view: { class: 'net.nanopay.cico.ui.bankAccount.form.BankDoneForm' } }
      ];
      this.SUPER();
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
        if ( this.position == 0 ) { // On Submission screen.
          // data from form
          var accountInfo = this.viewData;

          if ( ( accountInfo.accountName == null || accountInfo.accountName.trim() == '' ) ||
          ( accountInfo.transitNumber == null || accountInfo.transitNumber.trim() == '' ) ||
          ( accountInfo.accountNumber == null || accountInfo.accountNumber.trim() == '' ) ||
           accountInfo.bankNumber == null || accountInfo.bankNumber.trim() == '' ) {
            self.add(self.NotificationMessage.create({ message: 'Please fill out all necessary fields before proceeding.', type: 'error' }));
            return;
          }

          if ( ! /^[0-9]{1,35}$/.exec(accountInfo.accountNumber) ) {
            self.add(self.NotificationMessage.create({ message: 'Invalid account number.', type: 'error' }));
            return;
          }

          if ( ! /^[0-9]{5}$/.exec(accountInfo.transitNumber) ) {
            self.add(self.NotificationMessage.create({ message: 'Invalid transit number.', type: 'error' }));
            return;
          }

          if ( ! /^[0-9]{3}$/.exec(accountInfo.bankNumber) ) {
            self.add(self.NotificationMessage.create({ message: 'Invalid bank number.', type: 'error' }));
            return;
          }

          var newAccount = this.BankAccount.create({
            accountName: accountInfo.accountName,
            institutionNumber: accountInfo.bankNumber,
            transitNumber: accountInfo.transitNumber,
            accountNumber: accountInfo.accountNumber,
            owner: this.user.id
          });

          this.bankAccountDAO.put(newAccount).then(function(response) {
            self.newBankAccount = response;
            self.subStack.push(self.views[self.subStack.pos + 1].view);
            self.backLabel = 'Come back later';
            self.nextLabel = 'Verify';
          }).catch(function(error) {
            self.add(self.NotificationMessage.create({ message: error.message, type: 'error' }));
          });
        }

        if ( this.position == 1 ) {
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
