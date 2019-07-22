foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ExpediteResultView',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  documentation: 'Last step in the expedite transaction wizard. Responsible for diplaying the result of the action.',

  implements: [
    'foam.mlang.Expressions'
  ],

  imports: [],

  css: ``,

  properties: [],

  messages: [],

  methods: [
    function initE() {
      var self = this;
      this.nextLabel = 'Done';
    }
  ]
});
