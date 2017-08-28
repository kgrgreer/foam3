foam.CLASS({
  package: 'net.nanopay.transactionservice.model',
  name: 'Transaction',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'Long',
      name: 'payerId'
    },
    {
      class: 'Long',
      name: 'payeeId'
    },
    {
      class: 'Long',
      name: 'amount'
    },
    {
      class: 'DateTime',
      name: 'date'
    }
  ]
});
