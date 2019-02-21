foam.CLASS({
  package: 'net.nanopay.account',
  name: 'LoanedTotalAccount',
  extends: 'net.nanopay.account.ZeroAccount',
  documentation: 'Represents the total loaned for a specific currency',

methods: [
    {
      name: 'validateAmount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
        if ( amount+balance.getBalance() < 0 ) {
          throw new RuntimeException("Invalid transfer, "+this.getClass().getSimpleName()+" account balance must remain >= 0. " + this.getClass().getSimpleName()+"."+getName());
        }
      `
    }
]

})
