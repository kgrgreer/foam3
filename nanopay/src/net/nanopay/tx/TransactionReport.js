foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionReport',

    requires: [
      'net.nanopay.tx.model.Transaction',
    ],

    properties: [
      net.nanopay.tx.model.Transaction.ID.clone().copyFrom({
        label: 'Transaction ID'
      }),
      net.nanopay.tx.model.Transaction.PARENT.clone().copyFrom({
        label: 'Parent Transaction'
      }),
      net.nanopay.tx.model.Transaction.CREATED.clone().copyFrom({
        label: 'Created Time',
        expression: undefined

      }),
      net.nanopay.tx.model.Transaction.TYPE.clone(),
      net.nanopay.tx.model.Transaction.PAYEE_ID.clone(),
      net.nanopay.tx.model.Transaction.PAYER_ID.clone(),
      net.nanopay.tx.model.Transaction.SOURCE_CURRENCY.clone(),
      {
        class: 'String',
        name: 'amount'
      },
      {
        class: 'foam.core.Enum',
        of: 'net.nanopay.tx.model.TransactionStatus',
        name: 'status',
      },
      {
        class: 'String',
        name: 'fee'
      }
    ]
});
