foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ExpediteTransactionActionView',
  extends: 'net.nanopay.ui.wizard.WizardSubView',
  documentation: 'First step in the expedite transaction wizard. Responsible for capturing the expedite action.',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [],

  imports: [],

  css: ``,

  properties: [],

  methods: [
    function initE() {
      var self = this;
      this.nextLabel = 'Next';
    },
    async function getChildren(transaction) {
      var children = [transaction];
      if ( transaction.children ) {
        var txnChildren = await transaction.children.select();
        for ( var txn of txnChildren.array ) {
          var childChildren = await this.getChildren(txn);
          children = children.concat(childChildren);
        }
      }
      return children;
    }
  ]
});
