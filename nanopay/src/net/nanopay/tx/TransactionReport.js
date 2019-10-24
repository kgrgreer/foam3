foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionReport',

    requires: [
      'net.nanopay.tx.model.Transaction',
    ],

    properties: [
      net.nanopay.tx.model.Transaction.ID.clone(),
      net.nanopay.tx.model.Transaction.PARENT.clone(),
      net.nanopay.tx.model.Transaction.CREATED.clone(),
      net.nanopay.tx.model.Transaction.TYPE.clone(),
      net.nanopay.tx.model.Transaction.PAYEE_ID.clone(),
      net.nanopay.tx.model.Transaction.PAYER_ID.clone(),
      net.nanopay.tx.model.Transaction.AMOUNT.clone(),
      net.nanopay.tx.model.Transaction.SOURCE_CURRENCY.clone(),
      // {
      //   class: 'FObject',
      //   of: 'net.nanopay.tx.HistoricStatus',
      //   name: 'status',
      // },
      {
        class: 'String',
        name: 'fee'
      }
    ]
});
