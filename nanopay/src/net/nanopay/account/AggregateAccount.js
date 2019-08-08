foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AggregateAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  documentation: 'Calculates balance of all children accounts.',

  implements: [
    'foam.mlang.Expressions'
  ],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'java.util.ArrayList',
    'java.util.List',
    'net.nanopay.account.Account',
    'net.nanopay.account.AggregateAccount',
    'net.nanopay.fx.ExchangeRate',
  ],

  requires: [
    'net.nanopay.account.AggregateAccount',
    'net.nanopay.fx.ExchangeRate'
  ],

  methods: [
    {
      name: 'findBalance',
      code: async function(x) {
        var balance = 0;
        var sink = await x.accountDAO.where(
          this.EQ(net.nanopay.account.AggregateAccount.PARENT, this.id)
        ).select();
        var accounts = [];
        var list1 = sink.array;
        while( list1.length > 0) {
          var next = list1[0];
          if (! ( next.cls_ === net.nanopay.account.AggregateAccount ) ) {
            var childsSink = await x.accountDAO.where(
              this.EQ(net.nanopay.account.AggregateAccount.PARENT, next.id)
            ).select();
            const childsSinkArray = childsSink.array;
            for( var i = 0; i < childsSinkArray.length; i++ ) {
              if ( ! accounts.includes(childsSinkArray[i]) )
                list1.push(childsSinkArray[i]);
            }
          }
          if ( ! accounts.includes(next) ) accounts.push(next);
          list1 = list1.filter(val => val !== next);
        }

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
        List<Account> childrenList = new ArrayList();
        ArraySink childrenSink = (ArraySink) getChildren(x).select(new ArraySink());
        List<Account> list1 = childrenSink.getArray();
          while( list1.size() > 0 ) {
            Account next = list1.get(0);
            if ( ! ( next instanceof AggregateAccount ) ) {
              ArraySink childsChildrenSink = (ArraySink) next.getChildren(x).select(new ArraySink());
              for(Object obj: childsChildrenSink.getArray()) {
                Account childsChild = (Account) obj;
                if ( ! childrenList.contains(childsChild) ) {
                  list1.add(childsChild);
                }
              }
            }
            childrenList.add(next);
            list1.remove(next);
          }
          long balance = 0;
          for(Object obj: childrenList) {
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

