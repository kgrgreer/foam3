foam.ENUM({
  package: 'net.nanopay.tx.model',
  name: 'TransactionLimitTimeFrame',

  documentation: 'Available Time Frames for Transaction Limits',

  values: [
    {
      name: 'DAY',
      label: 'Day'
    },
    {
      name: 'WEEK',
      label: 'Week'
    },
    {
      name: 'MONTH',
      label: 'Month'
    },
    {
      name: 'YEAR',
      label: 'Year'
    }
  ]
});