foam.CLASS({
  package: 'net.nanopay.tx.ui.exposure',
  name: 'DebtAccountExposure',
  extends: 'foam.u2.View',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.tx.model.Transaction'
  ],

  imports: [
    'transactionDAO'
  ],

  properties: [
    {
      name: 'predicatedTransactionDAO',
      factory: function() {
        return this.transactionDAO.where(this.OR(
          this.EQ(this.Transaction.SOURCE_ACCOUNT, this.data.id),
          this.EQ(this.Transaction.DESTINATION_ACCOUNT, this.data.id)
        ));
      }
    }
  ],

  methods: [

  ]
});
