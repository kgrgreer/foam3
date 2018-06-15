foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'RetailTxn',
  extends: 'net.nanopay.tx.model.Transaction',

  properties: [
    {
      class: 'Currency',
      name: 'tip',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'Currency',
      name: 'total',
      visibility: foam.u2.Visibility.RO,
      label: 'Total Amount',
      transient: true,
      expression: function(amount, tip) {
        return amount + tip;
      },
      javaGetter: `return getAmount() + getTip();`,
      tableCellFormatter: function(total, X) {
        var formattedAmount = total / 100;
        var refund =
          (X.status == net.nanopay.tx.model.TransactionStatus.REFUNDED ||
              X.type == net.nanopay.cico.model.TransactionType.REFUND );

        this
          .start()
          .addClass(refund ? 'amount-Color-Red' : 'amount-Color-Green')
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
          .end();
      }
    },
  ]
});
