
foam.CLASS({
  package: 'net.nanopay.retail.ui.bankAccount.form',
  name: 'BankForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a bank account',

  requires: [
    'net.nanopay.retail.model.Account'
  ],

  imports: [
    'bankAccountDAO'
  ],

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  methods: [
    function init() {
      this.views = [
        { parent: 'addBank', id: 'form-addBank-info',         label: 'Account info',  view: { class: 'net.nanopay.retail.ui.bankAccount.form.BankInfoForm' } },
        { parent: 'addBank', id: 'form-addBank-verification', label: 'Verification',  view: { class: 'net.nanopay.retail.ui.bankAccount.form.BankVerificationForm' } },
        { parent: 'addBank', id: 'form-addBank-cashout',      label: 'Cashout plan',  view: { class: 'net.nanopay.retail.ui.bankAccount.form.BankCashoutForm' } },
        { parent: 'addBank', id: 'form-addBank-done',         label: 'Done',          view: { class: 'net.nanopay.retail.ui.bankAccount.form.BankDoneForm' } }
      ];
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'goBack',
      label: 'Back',
      isAvailable: function() { return false; },
      code: function() {}
    },
    {
      name: 'goNext',
      label: 'Next',
      isAvailable: function(position, errors) {
        if ( errors ) return false; // Error present
        if ( position < this.views.length - 1 ) return true;
        if ( position == this.views.length - 1 && this.inDialog) return true; // Last Page & in dialog
        return false; // Not in dialog
      },
      code: function() {
        if ( this.position == 0 ) { // On Submission screen.
          // data from form
          var accountInfo = this.viewData;
          var newAccount = this.Account.create({
            accountName: accountInfo.accountName,
            bankNumber: accountInfo.bankNumber,
            transitNumber: accountInfo.transitNumber,
            accountNumber: accountInfo.accountNumber,
          });

          this.bankAccountDAO.put(newAccount).then(function(response){
            console.log(response);
          });

          //TODO: MAKE API CALL TO ADD BANK ACCOUNT
            // TODO: CHECK IF SUCCESS OR FAILURE
            if ( true ) {
              this.subStack.push(this.views[this.subStack.pos + 1].view);
              return;
            }
        }

        if ( this.position == 1 ) { // On Verification screen
          //TODO: MAKE API CALL TO VERIFY BANK ACCOUNT
            // TODO: CHECK IF SUCCESS OR FAILURE
            if ( true ) {
              this.subStack.push(this.views[this.subStack.pos + 1].view);
              return;
            }
        }

        if ( this.position == 2 ) { // On Cashout Plan Selection
          //TODO: MAKE API CALL TO SELECT DEFAULT CASHOUT PLAN
            // TODO: CHECK IF SUCCESS OR FAILURE
            if ( true ) {
              this.subStack.push(this.views[this.subStack.pos + 1].view);
              return;
            }
        }

        if ( this.subStack.pos == this.views.length - 1 ) { // If last page
          if ( this.inDialog ) this.closeDialog();
          return;
        }
      }
    }
  ]
})
