foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'FinalBalance',

  documentation: 'Model to be added to transaction. It shows the balance of a particular account immediately after transaction execution',

  properties: [

    {
      class: 'Long',
      name: 'accountId'
    },
    {
      class: 'net.nanopay.account.Balance',
      name: 'balance'
    }
  ]

});
