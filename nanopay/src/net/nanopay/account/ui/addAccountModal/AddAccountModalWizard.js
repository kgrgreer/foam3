foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AddAccountModalWizard',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  methods: [
    function init() {
      this.views = [
        'typeSelection' : { view: { class: '' }, startPoint: true },
        'details': { view: { class: '' } },
        'limits': { view: { class: '' } },
        'thresholds': { view: { class: '' } }
      ];
    }
  ]
});
