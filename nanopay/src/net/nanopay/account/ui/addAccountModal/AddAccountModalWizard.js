foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AddAccountModalWizard',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Modal Wizard for adding an account',

  methods: [
    function init() {
      this.views = {
        'typeSelection' : { view: { class: 'net.nanopay.account.ui.addAccountModal.AccountTypeModal' }, startPoint: true },
        'details': { view: { class: '' } },
        'limits': { view: { class: '' } },
        'thresholds': { view: { class: '' } }
      };
    }
  ]
});
