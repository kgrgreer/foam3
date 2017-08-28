foam.CLASS({
  package: 'net.nanopay.ingenico.ui.transaction',
  name: 'TransactionListView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.transactionservice.model.Transaction',
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
        ^ .foam-u2-Tabs-tabRow {
          height: 55px;
          background-color: #2c4389;
        }
        ^ .foam-u2-Tabs-tab {
          width: 160px;
          height: 55px;
          background-color: #2c4389;
          font-family: Roboto;
          font-size: 16px;
          line-height: 55px;
          text-align: center;
          color: #ffffff;
          padding: 0px;
          border: 0px;
          border-radius: 0px;
          position: relative;
          z-index: 1;
        }
        ^ .foam-u2-Tabs-tab.selected {
          width: 160px;
          height: 55px;
          background: #2c4389;
          padding: 0px;
          border: 0px;
          border-radius: 0px;
          position: static;
          z-index: none;
        }
        ^ .foam-u2-Tabs-content {
          background: #000000;
          background-color: #000000;
          border: none;
          border-top: 6px solid #90a1d6;
          box-shadow: none;
          left: 0px;
          margin: 0px;
          padding: 0;
          position: relative;
          top: -6px;
        }
      */}
    })
  ],

  properties: [
    { name: 'data', factory: function () { return this.transactionDAO; } }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start({ class: 'foam.u2.Tabs' })
          .start({ class: 'foam.u2.Tab', label: 'Completed' })
            .select(this.data.where(this.EQ(this.Transaction.PENDING, false)), function (t) {
              this.add(self.TransactionRowView.create({ data: t }));
            })
          .end()
          .start({ class: 'foam.u2.Tab', label: 'Pending' })
            .select(this.data.where(this.EQ(this.Transaction.PENDING, true)), function (t) {
              this.add(self.TransactionRowView.create({ data: t }));
            })
          .end()
        .end()

    }
  ]
});