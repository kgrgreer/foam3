foam.CLASS({
  package: 'net.nanopay.account',
  name: 'TrustAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.model.Currency',

    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'java.util.List'
  ],

  properties: [
    {
      documentation: 'The Trust account mirrors a real world account, or an Account in another nanopay realm.',
      name: 'backingAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public TrustAccount find(X x, User sourceUser, String currency) {
            Logger logger   = (Logger) x.get("logger");
            User user = trustAccountUser(x, sourceUser.findSpid(x), currency);

            List accounts = ((ArraySink)((DAO)x.get("localAccountDAO"))
                            .where(
                              AND(
                                INSTANCE_OF(TrustAccount.class),
                                EQ(Account.OWNER, user.getId()),
                                EQ(Account.DENOMINATION, currency)
                              )
                            )
                            .select(new ArraySink())).getArray();
            if ( accounts.size() == 0 ) {
              logger.error("Trust account not found for", user.getId());
              throw new RuntimeException("Trust account not found for "+user.getId());
            } else if ( accounts.size() > 1 ) {
              logger.error("Multiple Trust accounts found for", user.getId());
              throw new RuntimeException("Multiple Trust accounts found for "+ user.getId());
            }
            return (TrustAccount) accounts.get(0);
          }

          static public TrustAccount find(X x, Account account) {
            return find(x, account.findOwner(x), account.getDenomination());
          }

          static public TrustAccount find(X x, User sourceUser, Currency currency) {
            return find(x, sourceUser, currency.getAlphabeticCode());
          }

          /**
           * Find User from trustAccountUser mapping from which the TrustAccount is associated.
           */
          static protected User trustAccountUser(X x, ServiceProvider sp, String currency) {
            Logger logger   = (Logger) x.get("logger");

            StringBuilder id = new StringBuilder();
            id.append(sp.getId());
            id.append(".");
            if ( currency == null ) {
              currency = "*";
            }
            id.append(currency);
            TrustAccountUserAssociation assoc = (TrustAccountUserAssociation)((DAO) x.get("localTrustAccountUserAssociationDAO")).find_(x, id.toString());
            if ( assoc == null ) {
              if ( currency == "*" ) {
                logger.error("Trust account user not found for ServiceProvider", sp, currency);
                throw new RuntimeException("Trust account not found for ServiceProvider "+sp.getId());
              }
              return trustAccountUser(x, sp, "*");
            }

            return assoc.findUser(x);
          }
      `);
      }
    }
  ],

  methods: [
    {
      documentation: 'Trust account is the inverse of it\'s backing account, so is always negative',
      name: 'validateAmount',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'balance',
          javaType: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          javaType: 'Long'
        }
      ],
      javaCode: `
        if ( amount == 0 ) {
          throw new RuntimeException("Zero transfer disallowed.");
        }
        if ( amount > 0 &&
             amount > -balance.getBalance() ) {
          throw new RuntimeException("Invalid transfer, Trust account balance must remain <= 0. " + this.getClass().getSimpleName()+"."+getName());
        }
      `
    }
  ]
});
