foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'TransactionListView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.merchant.ui.ErrorMessage',
    'net.nanopay.merchant.ui.transaction.TransactionRowView'
  ],

  imports: [
    'device',
    'toolbarIcon',
    'toolbarTitle',
    'transactionDAO'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
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

      this.addClass(this.myClass());
      this.transactionDAO
      .where(this.EQ(this.Transaction.DEVICE_ID, this.device.id))
      .orderBy(this.DESC(this.Transaction.DATE)).select().then(function (result) {
        if ( ! result ) {
          throw new Error('Unable to load transactions');
        }

        var a = result.array;
        for ( var i = 0; i < a.length; i++ ) {
          self.add(self.TransactionRowView.create({ data: a[i] }));
        }
      })
      .catch(function (err) {
        self.tag(self.ErrorMessage.create({ message: err.message }));
      });
    }
  ]
});