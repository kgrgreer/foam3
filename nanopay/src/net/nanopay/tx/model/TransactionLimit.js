foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TransactionLimit',

  documentation: 'Pre-defined limit for transactions.',

  properties: [
    {
      class: 'Long',
      name: 'id',
      required: true
    },
    {
      class: 'String',
      name: 'name',
      required: true
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitTimeFrame',
      name: 'timeFrame'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimitType',
      name: 'type'
    },
    {
      class: 'Currency',
      name: 'amount'
    }
  ]
});
