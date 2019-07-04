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
        'typeSelection' : { view: { class: 'net.nanopay.account.ui.addAccountModal.accountType.AccountTypeModal' }, startPoint: true },
        'details': { view: { class: 'net.nanopay.account.ui.addAccountModal.accountDetails.AccountDetailsModal' } },
        'limits': { view: { class: 'net.nanopay.account.ui.addAccountModal.transactionLimit.AccountTransactionLimitModal' } },
        'liquidity': { view: { class: 'net.nanopay.account.ui.addAccountModal.liquidityRule.LiquidityRuleModal' } },
        'submit': { view: { class: 'net.nanopay.account.ui.addAccountModal.AddAccountSubmissionModal' } }
      };
    },

    function initE() {
      this.addClass(this.myClass());
      this.SUPER();
    }
  ]
});
