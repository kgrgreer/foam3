foam.CLASS({
  package: 'net.nanopay.account',
  name: 'TrustAccount',
  extends: 'net.nanopay.account.ZeroAccount',

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
      documentation: 'The Trust account mirrors a real world reserve account, or an Account in another nanopay realm.',
      name: 'reserveAccount',
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.accountDAO,
          objToChoice: function(a) {
            return [a.id, a.name];
          }
        });
      }
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public TrustAccount find(X x, User sourceUser, String currency) {
            Logger logger   = (Logger) x.get("logger");
            ServiceProvider spid = sourceUser.findSpid(x) == null ? (ServiceProvider) ((DAO) x.get("serviceProviderDAO")).find("nanopay") : sourceUser.findSpid(x);
            User user = zeroAccountUser(x, spid , currency);

            List accounts = ((ArraySink)((DAO)x.get("localAccountDAO"))
                            .where(
                              AND(
                                INSTANCE_OF(TrustAccount.class),
                                EQ(Account.ENABLED, true),
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
      `);
      }
    }
  ]
});
