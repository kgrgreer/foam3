foam.CLASS({
  package: 'net.nanopay.tx.ui',
  name: 'ExpediteTransaction',

  implements: [
    'foam.mlang.Expressions'
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'transaction',
      postSet: function() {
        this.childTransactions = [];
        this.transaction$find
          .then((t) => this.getChildren(t))
          .then((a) => {
            this.childTransactions = a;
          });
      }
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'childTransactions',
      visibility: 'RO'
    }
  ],

  methods: [
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
