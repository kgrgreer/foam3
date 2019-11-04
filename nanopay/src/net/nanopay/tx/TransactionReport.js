foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'TransactionReport',

  requires: [
    'net.nanopay.tx.model.Transaction',
  ],

  properties: [
    net.nanopay.tx.model.Transaction.ID.clone().copyFrom({
      label: 'Txn ID'
    }),
    net.nanopay.tx.model.Transaction.PARENT.clone().copyFrom({
      label: 'Parent Txn'
    }),
    net.nanopay.tx.model.Transaction.CREATED.clone().copyFrom({
      label: 'Created Time',
      expression: undefined

    }),
    {
      class: 'String',
      name: 'type'
    },
    net.nanopay.tx.model.Transaction.PAYEE_ID.clone().copyFrom({
      label: 'Payee ID'
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
    },
    {
      class: 'String',
      name: 'fee'
    },
    {
      class: 'DateTime',
      name: 'statusUpdateTime',
      label: 'Status Update Time'
    }
  ]
});
