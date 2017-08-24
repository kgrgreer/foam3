foam.CLASS({
  package: 'net.nanopay.transactionservice.model',
  name: 'Transaction',

  properties: [
    {
      class: 'String',
      name: 'payerId'
    },
    {
      class: 'String',
      name: 'payeeId'
    },
    {
      class: 'Int',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'date'
    }
  ]
});
