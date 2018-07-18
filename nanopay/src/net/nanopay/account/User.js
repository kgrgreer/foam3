foam.CLASS({
  refines: 'foam.nanos.auth.User',

  documentation: `Find the a DigitalAccount of the requested currency,
else create one.`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.DigitalAccountService',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',

    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.logger.Logger',

    'java.util.List'
  ],

  imports: [
    'digitalAccount'
  ],

  requires: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
  ],

  methods: [
    {
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
      // Client Side
      code: function findDigitalAccount(x, currency) {
        currency = currency || 'CAD';
        return new Promise(function(resolve, reject) {
          console.log('findDigitalAccount');
          this.digitalAccount.getDefault(null, currency)
            .then(function(account) {
              if ( account != null ) {
                resolve(account);
              } else {
                console.error('findDigitalAccount', 'NOT FOUND');
                resolve(null);
              }
            });
        }.bind(this));
      },
      // Server Side
      javaReturns: 'net.nanopay.account.DigitalAccount',
      javaCode: `
    Logger logger = (Logger) x.get("logger");
    logger.info("User.findDigitalAccount");
    DigitalAccount account = null;
      synchronized(this) {

        String denomination = currency;
        if ( foam.util.SafetyUtil.isEmpty(denomination) ) {
          denomination = "CAD";
        }
        DAO dao = (DAO) x.get("localAccountDAO");
        List accounts = ((ArraySink) dao.where(
                                               AND(
                                                   INSTANCE_OF(DigitalAccount.class),
                                                   EQ(Account.OWNER, getId()),
                                                   EQ(Account.DENOMINATION, denomination),
                                                   EQ(Account.IS_DEFAULT, true)
                                                   )
                                               ).select(new ArraySink())).getArray();
        if ( accounts.size() == 1 ) {
          account = (DigitalAccount) accounts.get(0);
          logger.debug(this.getClass().getSimpleName(), "getDefault", "user", getId(), "denomination", denomination, account.toString(), "found");
        } else if ( accounts.size() == 0 ) {
          account = new DigitalAccount();
          account.setOwner(getId());
          account.setDenomination(denomination);
          account.setIsDefault(true);
          account = (DigitalAccount) dao.put_(x, account);
          logger.debug(this.getClass().getSimpleName(), "getDefault", "user", getId(), "denomination", denomination, account.toString(), "created");
          return account;
        } else {
          logger.warning(this.getClass().getSimpleName(), "getDefault", "user", getId(), "multiple default accounts found for denomination", denomination, "Using first found.");
          account = (DigitalAccount) accounts.get(0);
        }
      }

      return account;
`
    }
  ]
});
