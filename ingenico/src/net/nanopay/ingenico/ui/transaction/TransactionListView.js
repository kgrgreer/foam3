foam.CLASS({
  package: 'net.nanopay.ingenico.ui.transaction',
  name: 'TransactionListView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.ingenico.ui.transaction.TransactionRowView'
  ],

  imports: [
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

      this
        .addClass(this.myClass())
        .select(this.transactionDAO, function (t) {
          this.add(self.TransactionRowView.create({ data: t }));
        });
    }
  ]
});