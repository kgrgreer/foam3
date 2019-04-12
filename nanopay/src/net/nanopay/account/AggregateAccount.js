foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AggregateAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  documentation: 'Calculates balance of all children accounts.',

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'net.nanopay.account.Account',
    'net.nanopay.fx.ExchangeRate',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.AND',
    'java.util.List',
    'foam.util.SafetyUtil',
  ],

  requires: [
    'net.nanopay.account.AggregateAccount',
    'net.nanopay.fx.ExchangeRate'
  ],

  imports: [
    'accountDAO'
  ],

  properties: [

  ],

  methods: [
    {
      name: 'close',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'beneficiary',
          type: 'net.nanopay.account.Account'
        }
      ],
      documentation: 'Aggregate accounts can just be closed as their balance is purely representational',
      javaCode: `
        closeChildren_(x,beneficiary);
        this.setDeleted(true);
        ((DAO) x.get("accountDAO")).put(this);
        `
    },
       {
         name: 'closeAccount',
         args: [
           {
             name: 'x',
             type: 'Context'
            },
           {
             name: 'beneficiary',
             type: 'net.nanopay.account.Account'
           }
         ],
         documentation: 'Rules which ensure that the beneficiary account is allowed to receive my money when closing account',
         javaCode: `

          Account account = beneficiary.findParent(x);
            while ( account != null ) {
              if ( SafetyUtil.equals(account.getId(), this.getId()) )
                throw new RuntimeException( "The beneficiary account can not be a descendant of the account that is being closed");
              account = account.findParent(x);

            }

         close(x,beneficiary);
         `

       },
    {
      name: 'findBalance',
      javaReturns: 'long',
      returns: 'Promise',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        }
      ],
      code: async function(x) {
        var balance = 0;
        var sink = await x.accountDAO.where(
          this.EQ(net.nanopay.account.AggregateAccount.PARENT, this.id)
        ).select();
        var accounts = sink.array;
        for ( var i = 0; i < accounts.length; i++ ) {
          if ( accounts[i].type == 'ShadowAccount' ) continue;
          var accBal = await accounts[i].findBalance(x);
          if ( this.denomination !== accounts[i].denomination ) {
            var exchangeRate = await x.exchangeRateDAO.where(
                this.AND(
                  this.EQ(this.ExchangeRate.FROM_CURRENCY, accounts[i].denomination),
                  this.EQ(this.ExchangeRate.TO_CURRENCY, this.denomination)
                )
            ).select();
            if ( exchangeRate && exchangeRate.array.length > 0 ) {
              accBal = Math.round(accBal * exchangeRate.array[0].rate);
            }
          }
          balance = balance + accBal;
        }
        return balance;
      },
      javaCode: `
      ArraySink childrenSink = (ArraySink) getChildren(x).select(new ArraySink());
          long balance = 0;
          for(Object obj: childrenSink.getArray()) {
            Account child = (Account) obj;
            long childBalance = (Long) child.findBalance(x);
            if( ! getDenomination().equals(child.getDenomination()) )
            {
              DAO exchangeRateDAO = (DAO) x.get("exchangeRateDAO");
              ArraySink exchangeRateSink = (ArraySink) exchangeRateDAO.where(
                AND(
                  EQ(ExchangeRate.FROM_CURRENCY, child.getDenomination()),
                  EQ(ExchangeRate.TO_CURRENCY, getDenomination())
                )
              ).select(new ArraySink());
              List exchangeRates = exchangeRateSink.getArray();
              if( exchangeRates.size() > 0 ) {
                Double convertedBalance = childBalance * ((ExchangeRate) exchangeRates.get(0)).getRate();
                childBalance = Math.round(convertedBalance);
              }
            }
              balance += childBalance;
          }
          return balance;
      `
    }
  ]
});
