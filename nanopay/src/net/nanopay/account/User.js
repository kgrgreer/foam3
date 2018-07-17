foam.CLASS({
  refines: 'foam.nanos.auth.User',

  documentation: `Find the a DigitalAccount of the requested currency,
else create one.`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  imports: [
    'accountDAO',
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.Eq'
  ],

  methods: [
    {
      // TODO:  synchronize with threadLocal
      name: 'findDigitalAccount',
      args: [
        {
          name: 'x',
          of: 'foam.core.X'
        },
        {
          name: 'currency',
          of: 'String'
        }
      ],
      code: function findDigitalAccount(x, currency) {
        currency = currency || 'CAD';
        return new Promise(function(resolve, reject) {
          console.log('findDigitalAccount', 'accountDAO.find');
          x.accountDAO.find(
            this.And.create({
              args: [
                this.Eq.create({ arg1: this.Account.TYPE, arg2: this.DigitalAccount.name }),
                this.Eq.create({ arg1: this.Account.OWNER, arg2: this.id }),
                this.Eq.create({ arg1: this.Account.DENOMINATION, arg2: currency })
              ]
            })
          ).then(function(account) {
            if ( account != null ) {
              resolve(account);
            } else {
              account = this.DigitalAccount.create({
                owner: this.id,
                denomination: currency
              });
              x.accountDAO.put_(x, account).then(function(a) {
                console.log('findDigitalAccount', 'accountDAO.put', a.owner, a);
                resolve(a);
              });
            }
          }.bind(this));
        }.bind(this));
      },
      javaReturns: 'net.nanopay.account.DigitalAccount',
      javaCode: `
DigitalAccount account = null;
synchronized (this) {
        String denomination = currency;
        if ( foam.util.SafetyUtil.isEmpty(denomination) ) {
          denomination = "CAD";
        }
        DAO dao = (DAO) x.get("localAccountDAO");
        List accounts = ((ArraySink) dao.where(
          AND(
            EQ(Account.TYPE, DigitalAccount.class.getSimpleName()),
            EQ(Account.OWNER, getId()),
            EQ(Account.DENOMINATION, denomination)
          )
        ).select(new ArraySink())).getArray();
        if ( accounts.size() == 1 ) {
          account = (DigitalAccount) accounts.get(0);
        } else if ( accounts.size() == 0 ) {
          account = new DigitalAccount();
          account.setOwner(getId());
          account.setDenomination(denomination);
          account = (DigitalAccount) dao.put_(x, account );
          ((Logger) x.get("logger")).log("findDigitalAccount", "accountDAO.put", account.getOwner(), account.toString());
          return account;
        } else {
          // ?
          account = (DigitalAccount) accounts.get(0);
        }
}
return account;
`
    }
  ]
});
