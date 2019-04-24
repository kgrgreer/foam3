foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DigitalAccount',
  extends: 'net.nanopay.account.Account',

  documentation: 'Digital Account. Default to monetary denomination.',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.account.DigitalAccountService',
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
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'java.util.List'
  ],

  imports: [
    'accountDAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'denomination',
      aliases: ['currencyCode', 'currency'],
      value: 'CAD'
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public DigitalAccount findDefault(X x, User user, String currency) {
            Logger logger = (Logger) x.get("logger");
            DigitalAccount account = null;

            synchronized(String.valueOf(user.getId()).intern()) {
              logger.info(DigitalAccount.class.getSimpleName(), "findDefault", "user", user.getId(), "currency", currency);

              // Select currency of user's country.
              String denomination = currency;
              if ( denomination == null ) {
                denomination = "CAD";
                String country = "CA";
                Address address = user.getAddress();

                if ( address != null && address.getCountryId() != null ) {
                  country = address.getCountryId().toString();
                }

                DAO currencyDAO = (DAO) x.get("currencyDAO");
                List currencies = ((ArraySink) currencyDAO
                  .where(EQ(Currency.COUNTRY, country))
                  .select(new ArraySink())).getArray();

                if ( currencies.size() == 1 ) {
                  denomination = ((Currency) currencies.get(0)).getAlphabeticCode();
                } else if ( currencies.size() > 1 ) {
                  logger.warning(DigitalAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                }
              }

              DAO accountDAO  = user.getAccounts(x);

              List accounts = ((ArraySink) accountDAO
                .where(
                  AND(
                    EQ(Account.ENABLED, true),
                    INSTANCE_OF(DigitalAccount.class),
                    EQ(Account.DENOMINATION, denomination),
                    EQ(Account.IS_DEFAULT, true)
                  )
                )
                .select(new ArraySink())).getArray();

              if ( accounts.size() == 0 ) {
                account = new DigitalAccount();
                account.setDenomination(denomination);
                account.setIsDefault(true);
                account.setOwner(user.getId()); // required until user.getAccounts()
                account = (DigitalAccount) accountDAO.put(account);
              } else {
                if ( accounts.size() > 1 ) {
                  logger.warning(DigitalAccount.class.getClass().getSimpleName(), "user", user.getId(), "multiple accounts found for denomination", denomination, "Using first found.");
                }
                account = (DigitalAccount) accounts.get(0);
              }
            }

            return account;
          }
        `);
      }
    }
  ]
});
