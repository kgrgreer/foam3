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
      long bal = balance == null ? 0L : balance.getBalance();

        if ( amount < 0 &&
            -amount > bal  ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", bal);
          throw new RuntimeException("Invalid transfer, "+this.getClass().getSimpleName()+" account balance must remain >= 0. "+getName());
        }
      `
    }
  ]
})
