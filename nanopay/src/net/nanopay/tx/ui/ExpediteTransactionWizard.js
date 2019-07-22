foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ExpediteTransactionWizard',
  extends: 'net.nanopay.ui.wizard.WizardView',
  documentation: 'Wizard view for expediting transactions.',
  
  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],
  
  imports: [
    'transactionDAO'
  ],

  axioms: [
    { class: 'net.nanopay.ui.wizard.WizardCssAxiom' }
  ],

  css: ``,

  properties: [
    {
      name: 'transactionDAO',
      factory: function() {
        return this.transactionDAO;
      }
    }
  ],

  messages: [],

  methods: [
    function init() {}
  ],

  actions: []
});
