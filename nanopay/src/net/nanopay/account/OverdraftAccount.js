foam.CLASS({
  package: 'net.nanopay.account',
  name: 'OverdraftAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  documentation: 'OverDraft Account. Its balance can go to a negative value that is the negative of the overdraftLimit',

  javaImports: [

  ],

  properties: [
    {
      class: 'Long',
      name: 'overdraftLimit',
      value: 0
    }
  ],
  methods: [
    {
      documentation: 'OverDraft account provides liquidity via a backing account. It can have a positive or negative balance.'
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
             -amount > bal + getOverdraftLimit() ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", bal);
          throw new RuntimeException("Insufficient balance/overdraft in account " + this.getId());
        }
      `
    }
  ]
});

