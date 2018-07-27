foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DigitalAccountInfo',
 

  properties: [
    {
      class: 'Long',
      name: 'id',
    }, 
    {
      class: 'String',
      name: 'accountId',
    }, 
    {
      class: 'String',
      name: 'balance',
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
      class: 'Double',
      name: 'transactionsSumRecieved',
    }, 
    {
      class: 'Double',
      name: 'transactionsSumSent',
    },
  ]
});