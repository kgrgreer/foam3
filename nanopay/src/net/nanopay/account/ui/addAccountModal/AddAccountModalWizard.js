foam.CLASS({
  package: 'net.nanopay.account.ui.addAccountModal',
  name: 'AddAccountModalWizard',
  extends: 'net.nanopay.ui.wizardModal.WizardModal',

  documentation: 'Modal Wizard for adding an account',

  css: `
    ^ {
      background: white;
    }
  `,

  methods: [
    function init() {
      this.views = {
        'typeSelection' : { view: { class: 'net.nanopay.account.ui.addAccountModal.AccountTypeModal' }, startPoint: true },
        'details': { view: { class: 'net.nanopay.account.ui.addAccountModal.AccountDetailsModal' } },
        'limits': { view: { class: 'net.nanopay.account.ui.addAccountModal.AccountLimitModal' } },
        'liquidity': { view: { class: 'net.nanopay.account.ui.addAccountModal.AccountLiquidityModal' } },
        'submit': { view: { class: 'net.nanopay.account.ui.addAccountModal.AccountSubmissionModal' } }
      };
    },

    function initE() {
      this.addClass(this.myClass());
      this.SUPER();
    }
  ]
});
