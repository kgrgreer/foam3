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
    'java.util.List'
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

              long myId = this.getId();

              DAO accountDAO = (DAO) x.get("accountDAO");
              AggregateAccount thisAccount = (AggregateAccount) accountDAO.find(this).fclone();
              accountDAO
                .where(
                  AND(
                    EQ( DigitalAccount.DELETED, false ),
                    EQ( DigitalAccount.PARENT, this.getId() ),
                    INSTANCE_OF( DigitalAccount.CLASS )
                  )
                )
                .select(new AbstractSink(){
                  @Override
                  public void put(Object o, Detachable d ) {
                    DigitalAccount account = (DigitalAccount) ( (DigitalAccount) o).deepClone();
                      account.close(x, beneficiary);
                  }
                });
        thisAccount.setDeleted(true);
        ((DAO) x.get("accountDAO")).put(thisAccount);
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
