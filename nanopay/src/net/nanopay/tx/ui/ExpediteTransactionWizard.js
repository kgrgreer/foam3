foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ExpediteTransactionWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',
  documentation: 'Wizard view for expediting transactions.',
  
  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],
  
  imports: [
    'transactionDAO',
    'user'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  css: ``,

  properties: [
    'parentTransaction'
  ],

  messages: [],

  methods: [
    function init() {
      this.viewData.user = this.user;
      this.title = 'Transaction workflow';
      this.viewData.parentTransaction = this.parentTransaction;

      this.views = [
        { id: 'expedite-transaction-action', label: 'Modify Transaction States', view: { class: 'net.nanopay.tx.ui.ExpediteTransactionActionView' } },
        { id: 'confirm-expedite', label: 'Confirm Action', view: { class: 'net.nanopay.tx.ui.ConfirmExpediteView' } },
        { id: 'expedite-result', label: 'Result', view: { class: 'net.nanopay.tx.ui.ExpediteResultView' } }
      ];

      // Keep this at bottom of init function
      this.SUPER();
    }
  ],

  actions: []
});
