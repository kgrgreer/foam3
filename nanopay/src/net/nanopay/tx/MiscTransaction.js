foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'MiscTransaction',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    // {
    //   class: 'Double',
    //   name: 'rate',
    //   visibility: foam.u2.Visibility.RO,
    //   tableCellFormatter: function(rate) {
    //     this.start().add(rate.toFixed(2)).end();
    //   }
    // },
    // {
    //   class: 'FObjectArray',
    //   visibility: foam.u2.Visibility.RO,
    //   name: 'feeTransactions',
    //   of: 'net.nanopay.tx.model.Transaction'
    // },
    // {
    //   class: 'FObjectArray',
    //   name: 'informationalFees',
    //   visibility: foam.u2.Visibility.RO,
    //   of: 'net.nanopay.tx.model.Fee'
    // },
    // TODO: field for tax as well? May need a more complex model for that
 ]
});
