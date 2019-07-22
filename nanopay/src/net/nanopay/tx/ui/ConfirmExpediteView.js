foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ConfirmExpediteView',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  documentation: 'Second step in the expedite transaction wizard. Responsible for confirming the action.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'ctrl'
  ],

  css: ``,

  properties: [],

  messages: [],

  methods: [
    function initE() {
      var self = this;
      this.nextLabel = 'Confirm';
    }
  ]
});
