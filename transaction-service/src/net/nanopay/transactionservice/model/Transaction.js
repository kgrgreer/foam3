foam.CLASS({
  package: 'net.nanopay.transactionservice.model',
  name: 'Transaction',

  properties: [
    {
      class: 'Long',
      name: 'payerId'
    },
    {
      class: 'Long',
      name: 'payeeId'
    },
    {
      class: 'Int',
      name: 'amount'
    },
    {
      class: 'DateTime',
      name: 'date'
    }
  ]
});
