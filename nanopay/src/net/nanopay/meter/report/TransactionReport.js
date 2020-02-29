foam.CLASS({
  package: 'net.nanopay.meter.report',
  name: 'TransactionReport',

  requires: [
    'net.nanopay.tx.model.Transaction',
  ],

  properties: [
    net.nanopay.tx.model.Transaction.ID.clone().copyFrom({
      label: 'Txn ID',
      tableWidth: 300
    }),
    net.nanopay.tx.model.Transaction.PARENT.clone().copyFrom({
      label: 'Parent Txn',
      tableWidth: 300
    }),
    {
      class: 'DateTime',
      name: 'created',
      label: 'Created Time',
      tableWidth: 130
    },
    {
      class: 'String',
      name: 'type',
      tableWidth: 140
    },
    net.nanopay.tx.model.Transaction.PAYEE_ID.clone().copyFrom({
      label: 'Payee ID',
    }),
    net.nanopay.tx.model.Transaction.PAYER_ID.clone().copyFrom({
      label: 'Payer ID'
    }),
    net.nanopay.tx.model.Transaction.SOURCE_CURRENCY.clone(),
    {
      class: 'String',
      name: 'amount'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      tableWidth: 160
    },
    {
      class: 'String',
      name: 'fee'
    },
    {
      class: 'DateTime',
      name: 'statusUpdateTime',
      label: 'Status Update Time',
      tableWidth: 180
    }
  ]
});
