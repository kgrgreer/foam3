foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DigitalAccountInfo',
  ids: ['accountId'],

  properties: [
    {
      class: 'String',
      name: 'balance',
    },
    {
      class: 'String',
      name: 'accountId',
    }, 
    {
      class: 'String',
      name: 'owner',
    }, 
    {
      class: 'String',
      name: 'currency',
    }, 
    {
      class: 'Long',
      name: 'transactionsRecieved',
    }, 
    {
      class: 'Long',
      name: 'transactionsSent',
    },
    {
      class: 'Long',
      name: 'transactionsSumRecieved',
    }, 
    {
      class: 'Long',
      name: 'transactionsSumSent',
    },
  ]
});