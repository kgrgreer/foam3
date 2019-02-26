foam.CLASS({
  package: 'net.nanopay.account',
  name: 'LoanAccount',
  extends: 'net.nanopay.account.Account',
  documentation: 'Base class/model of all LoanAccounts',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.tx.InterestTransaction',
    'foam.dao.DAO',
    'foam.mlang.MLang'
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
      class: 'Long',
      name: 'accumulatedInterest',
      documentation: 'The amount of interest accumulated thus far',
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
/* //Commented out to allow interest accumulation beyond the credit limit of the account.
          if ( (amount+bal) < -this.getPrincipal() ) {
            foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
            logger.debug(this, "amount", amount, "balance", bal);
            throw new RuntimeException("Cannot exceed credit limit in account " + this.getId());
          }
*/
           if( amount+bal > 0 ) {
               foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
               logger.debug(this, "amount", amount, "balance", bal);
               throw new RuntimeException("Cannot over pay account " + this.getId());
           }
        `
      },

      {
      documentation: 'Add unapplied interest',
      name: 'addInterest',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
        this.setAccumulatedInterest(amount+this.getAccumulatedInterest());
      `
      },
            {
            documentation: 'Add unapplied interest',
            name: 'compound',
            args: [
              {
                name: 'x',
                type: 'Context'
              },
            ],
            javaCode: `

            if( this.getAccumulatedInterest() > 0 ) {
              LoanedTotalAccount globalLoanAccount = (LoanedTotalAccount) ((DAO) x.get("localAccountDAO")).find(MLang.AND(MLang.EQ(LoanedTotalAccount.DENOMINATION,this.getDenomination()),MLang.INSTANCE_OF(LoanedTotalAccount.class)));
              if ( globalLoanAccount == null ) throw new RuntimeException(" LoanedTotalAccount not found!");
              InterestTransaction it = new InterestTransaction.Builder(x)
                .setSourceAccount(this.getId())
                .setDestinationAccount(globalLoanAccount.getId())
                .setAmount(this.getAccumulatedInterest())
                .build();
              ((DAO) x.get("transactionDAO")).put_(x,it);
              this.setAccumulatedInterest(0);
            }
            `
            },

  ]

})
