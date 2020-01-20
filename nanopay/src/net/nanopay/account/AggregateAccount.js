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

  properties: [
    {
      name: 'denomination',
      updateMode: 'RW'
    },
    {
      name: 'liquiditySetting',
      createMode: 'HIDDEN',
      updateMode: 'HIDDEN',
      readMode: 'HIDDEN'
    }
  ],

  methods: [
    {
      name: 'findBalance',
      code: async function(x) {
        return await x.balanceService.findBalance(x,this.id);
      },
      javaCode: `
        // TODO: need to wire up more efficient way of calculating
        List<Account> childrenList = new ArrayList();
        ArraySink childrenSink = (ArraySink) getChildren(x).select(new ArraySink());
        List<Account> list1 = childrenSink.getArray();

        while ( list1.size() > 0 ) {
          Account next = list1.get(0);
          if ( ! ( next instanceof AggregateAccount ) ) {
            ArraySink childsChildrenSink = (ArraySink) next.getChildren(x).select(new ArraySink());
            for ( Object obj: childsChildrenSink.getArray() ) {
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

        for ( Object obj: childrenList ) {
          Account child = (Account) obj;
          long childBalance = (Long) child.findBalance(x);
          if ( ! getDenomination().equals(child.getDenomination()) ) {
            DAO exchangeRateDAO = (DAO) x.get("exchangeRateDAO");
            ArraySink exchangeRateSink = (ArraySink) exchangeRateDAO.where(
              AND(
                EQ(ExchangeRate.FROM_CURRENCY, child.getDenomination()),
                EQ(ExchangeRate.TO_CURRENCY, getDenomination())
              )
            ).select(new ArraySink());
            List exchangeRates = exchangeRateSink.getArray();
            if ( exchangeRates.size() > 0 ) {
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

