foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionLimit',

  documentation: 'Pre-defined limit for transactions.',

  ids: [ 'name', 'timeFrame', 'type' ],

  properties: [
    {
      class: 'String',
      name: 'name',
      documentation: 'Transaction limit name.'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
      name: 'timeFrame',
      documentation: 'Transaction limit time frame. (Day, Week etc.)'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitType',
      name: 'type',
      documentation: 'Transaction limit type. (Send or Receive)'
    },
    {
      class: 'Currency',
      name: 'amount',
      documentation: 'Transaction limit amount.'
    }
  ]
});
