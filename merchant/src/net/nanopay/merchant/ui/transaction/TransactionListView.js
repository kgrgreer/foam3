foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'TransactionListView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.merchant.ui.transaction.TransactionRowView'
  ],

  imports: [
    'toolbarIcon',
    'toolbarTitle',
    'transactionDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          height: 100%;
          background-color: #ffffff;
          position: relative;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarTitle = 'Transactions';
      this.toolbarIcon = 'menu';

      this
        .addClass(this.myClass());

      this.transactionDAO.select().then(function (result) {
        var transactions = result.array;
        for ( var i = 0; i < transactions.length; i++ ) {
          setTimeout(function (i) {
            return function () {
              self.add(self.TransactionRowView.create({ data: transactions[i] }));
            }
          }(i), 0);
        }
      });
    }
  ]
});