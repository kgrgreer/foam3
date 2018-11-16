foam.CLASS({
  package: 'net.nanopay.merchant.ui.transaction',
  name: 'TransactionListView',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.RetailTransaction',
    'net.nanopay.merchant.ui.ErrorMessage',
    'net.nanopay.merchant.ui.transaction.TransactionRowView'
  ],

  imports: [
    'currentAccount',
    'user',
    'device',
    'toolbarIcon',
    'toolbarTitle',
    'transactionDAO'
  ],

  css: `
    ^ {
      height: 100%;
      background-color: #ffffff;
      position: relative;
      overflow: scroll;
    }
  `,

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarTitle = 'Transactions';
      this.toolbarIcon = 'menu';

      this.addClass(this.myClass());
      this.transactionDAO.where(this.AND(
        this.EQ(this.RetailTransaction.DEVICE_ID, this.device.id)),
        this.OR(
          this.EQ(this.RetailTransaction.SOURCE_ACCOUNT, this.currentAccount),
          this.EQ(this.RetailTransaction.DESTINATION_ACCOUNT, this.currentAccount)
        )
      ).select().then(function(result) {
        if ( ! result ) {
          throw new Error('Unable to load transactions');
        }

        var a = result.array;
        for ( var i = 0; i < a.length; i++ ) {
          // skip transactions that don't apply
          if ( a[i].destinationAccount !== self.currentAccount &&
            a[i].sourceAccount !== self.currentAccount ) {
            continue;
          }

          self.add(self.TransactionRowView.create({
            transaction: a[i]
          }));
        }
      })
      .catch(function(err) {
        self.tag(self.ErrorMessage.create({ message: err.message }));
      });
    }
  ]
});
