foam.CLASS({
  package: 'net.nanopay.admin.ui.settings.bankAccount.form',
  name: 'BankForm',
  extends: 'net.nanopay.ui.wizard.WizardView',

  documentation: 'Pop up that extends WizardView for adding a bank account',

  axioms: [
    foam.u2.CSS.create({code: net.nanopay.ui.wizard.WizardView.getAxiomsByClass(foam.u2.CSS)[0].code})
  ],

  methods: [
    function init() {
      this.SUPER();
      this.views = [
        { parent: 'addBank', id: 'form-addBank-info',         label: 'Account info',  view: { class: 'net.nanopay.admin.ui.settings.bankAccount.form.BankInfoForm' } },
        { parent: 'addBank', id: 'form-addBank-deposit',      label: 'Verification',  view: { class: 'net.nanopay.admin.ui.settings.bankAccount.form.BankVerifyDeposit' } },
        { parent: 'addBank', id: 'form-addBank-verification', label: 'Verification',  view: { class: 'net.nanopay.admin.ui.settings.bankAccount.form.BankVerificationForm' } },
        { parent: 'addBank', id: 'form-addBank-done',         label: 'Done',          view: { class: 'net.nanopay.admin.ui.settings.bankAccount.form.BankDoneForm' } }
      ];
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

        if ( this.position == 2 ) { // On Done Screen
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
