foam.INTERFACE({
  package: 'net.nanopay.tx',
  name: 'TransactionLimitServiceInterface',

  documentation: `
  A nanoService for retrieving transaction Limits based on the rules applied 
  on users, accounts and transactions.    
`,

    methods: [
      {
        name: 'getTransactionLimit',
        async: true,
        type: 'List',
        args: [
          {
            name: 'x',
            type: 'Context'
          },
          {
            name: 'sourceAccountId',
            type: 'Long'
          }
        ]
      }
    ]
});
