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
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimiTimeFrame',
      name: 'timeFrame'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionLimiType',
      name: 'type'
    },
    {
      class: 'Currency',
      name: 'amount'
    }
  ]
});
