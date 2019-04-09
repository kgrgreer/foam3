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

  imports: [
    'accountDAO'
  ],

  properties: [

  ],

  methods: [
    {
      name: 'findBalance',
      javaReturns: 'long',
      returns: 'Promise',
      args: [
        {
          name: 'x',
          type: 'Context'
        }
      ],
      code: async function(x) {
        var balance = 0;
        var sink = await x.accountDAO.where(
          this.EQ(net.nanopay.account.AggregateAccount.PARENT, this.id)
        ).select();
        var accounts = [];
        var list1 = sink.array;
        while( list1.size() > 0) {
          var next = list1.get(0);
          if (! ( next instanceof net.nanopay.account.AggregateAccount ) ) {
            var childsSink = await x.accountDAO.where(
              this.EQ(net.nanopay.account.AggregateAccount.PARENT, next.id)
            ).select().array;
            for( var i = 0; i < childsSink.length; i++ ) {
              if ( ! accounts.contains(childsSink[i]) )
                list1.push(childsSink[i]);
            }
          }
          if ( ! accounts.contains(next) )
            accounts.add(next)
          list1.remove(next);
        }

        for ( var i = 0; i < accounts.length; i++ ) {
          if ( accounts[i].type == 'ShadowBankAccount' ) continue;
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

foam.RELATIONSHIP({
  cardinality: '1:*',
  sourceModel: 'net.nanopay.account.AggregateAccount',
  targetModel: 'net.nanopay.account.Account',
  forwardName: 'children',
  inverseName: 'parent',
  sourceDAOKey: 'accountDAO',
  sourceProperty: {
    hidden: true
  },
  targetProperty: {
    view: function(_, X) {
      var E = foam.mlang.Expressions.create();
      return {
        class: 'foam.u2.view.ReferenceView',
        dao: X.accountDAO.where(E.EQ(net.nanopay.account.Account.TYPE, 'AggregateAccount')).orderBy(net.nanopay.account.Account.NAME),
        objToChoice: function(o) { return [o.id, o.name ? o.name : '' + o.id]; }
      };
    }
  }
});
