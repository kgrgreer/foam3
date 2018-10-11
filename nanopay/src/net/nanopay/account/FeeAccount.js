foam.CLASS({
  package: 'net.nanopay.account',
  name: 'FeeAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  documentation: `
    Digital Fee Account is used to hold transaction fees.
  `,

  properties: [
  ],
  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public FeeAccount find(X x, User user, String currency) {
            Logger logger   = (Logger) x.get("logger");

            if ( currency == null ) currency = "CAD";
            List accounts = ((ArraySink)((DAO)x.get("localAccountDAO"))
                            .where(
                              AND(
                                INSTANCE_OF(FeeAccount.class),
                                EQ(Account.OWNER, user.getId()),
                                EQ(Account.DENOMINATION, currency)
                              )
                            )
                            .select(new ArraySink())).getArray();
            if ( accounts.size() == 0 ) {
              logger.error("Fee account not found for", user.getId());
              throw new RuntimeException("Fee account not found for "+user.getId());
            } else if ( accounts.size() > 1 ) {
              logger.error("Multiple Fee accounts found for", user.getId());
              throw new RuntimeException("Multiple Fee accounts found for "+ user.getId());
            }
            return (FeeAccount) accounts.get(0);
          }

          static public FeeAccount find(X x, User user, Currency currency) {
            return find(x, user, currency.getAlphabeticCode());
          }
      `);
      }
    }
  ]
});
