foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionLimit',

  documentation: 'Pre-defined limit for transactions.',

  ids: [ 'name', 'timeFrame', 'type' ],

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
      swiftType: 'TransactionLimitTimeFrame',
      name: 'timeFrame'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitType',
      swiftType: 'TransactionLimitType',
      name: 'type'
    },
    {
      class: 'Currency',
      name: 'amount'
    }
  ]
});
