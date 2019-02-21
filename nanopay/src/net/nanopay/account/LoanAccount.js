foam.CLASS({
  package: 'net.nanopay.account',
  name: 'LoanAccount',
  extends: 'net.nanopay.account.Account',
  documentation: 'Base class/model of all LoanAccounts',

  javaImports: [
    'net.nanopay.account.Account'

  ],

  properties: [
    {
      class: 'Double',
      name: 'rate',
      documentation: 'The interest rate for the loan'
    },
    {
      class: 'Long',
      name: 'Principal',
      documentation: 'The maximum that can be borrowed',
      value: 0
    },
    {
      name: 'lenderAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      documentation: 'The account where the loan $ are lent from'
    },
  ],
  methods:[
  {
        documentation: 'Allow Account to only go between -principal limit and 0',
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

          if ( (amount+bal) < -this.getPrincipal() ) {
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
            logger.debug(this, "amount", amount, "balance", bal);
            throw new RuntimeException("Cannot exceed credit limit in account " + this.getId());
          }

           if( amount+bal > 0 ) {
               foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
               logger.debug(this, "amount", amount, "balance", bal);
               throw new RuntimeException("Cannot over pay account " + this.getId());
           }
        `
      }

  ]

})
