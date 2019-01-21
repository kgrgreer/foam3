foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'LineItemAmount',

  properties: [
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.LineItemAmountType',
      name: 'type',
      value: 'TOTAL'
    },
    {
      class: 'Currency',
      name: 'value',
      tableCellFormatter: function(amount, X) {
        var formattedAmount = amount;
        if ( this.type == net.nanopay.tx.LineItemAmountType.PERCENT ) {
          formattedAmount = amount/100;
          this
            .start()
            .add(formattedAmount, '%')
            .end();
        } else {
          this
            .start()
            .add('$', X.addCommas(formattedAmount.toFixed(2)))
            .end();
        }
      }
    },
  ]
});
