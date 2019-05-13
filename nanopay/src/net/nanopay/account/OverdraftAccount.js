foam.CLASS({
  package: 'net.nanopay.account',
  name: 'OverdraftAccount',
  extends: 'net.nanopay.account.DigitalAccount',

  documentation: 'OverDraft Account. Its balance can go to a negative value that is the negative of the overdraftLimit',

  javaImports: [
    'net.nanopay.model.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.List'
  ],

  properties: [
    {
      class: 'Long',
      name: 'overdraftLimit',
      value: 0
    }
  ],
  methods: [
    {
      documentation: 'OverDraft account provides liquidity via a backing account. It can have a positive or negative balance.',
      name: 'validateAmount',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'balance',
          type: 'net.nanopay.account.Balance'
        },
        {
          name: 'amount',
          type: 'Long'
        }
      ],
      javaCode: `
        long bal = balance == null ? 0L : balance.getBalance();

        if ( amount < 0 &&
             -amount > bal + getOverdraftLimit() ) {
          foam.nanos.logger.Logger logger = (foam.nanos.logger.Logger) x.get("logger");
          logger.debug(this, "amount", amount, "balance", bal);
          throw new RuntimeException("Insufficient balance/overdraft in account " + this.getId());
        }
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          static public OverdraftAccount findDefault(X x, User user, String currency) {
            Logger logger = (Logger) x.get("logger");
            OverdraftAccount account = null;

            synchronized(String.valueOf(user.getId()).intern()) {
              logger.info(OverdraftAccount.class.getSimpleName(), "findDefault", "user", user.getId(), "currency", currency);

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
                  logger.warning(OverdraftAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
                }
              }

              DAO accountDAO  = user.getAccounts(x);

              List accounts = ((ArraySink) accountDAO
                .where(
                  AND(
                    EQ(Account.ENABLED, true),
                    INSTANCE_OF(OverdraftAccount.class),
                    EQ(Account.DENOMINATION, denomination),
                    EQ(Account.IS_DEFAULT, true)
                  )
                )
                .select(new ArraySink())).getArray();

              if ( accounts.size() == 0 ) {
                account = new OverdraftAccount();
                account.setDenomination(denomination);
                account.setIsDefault(true);
                account.setOwner(user.getId()); // required until user.getAccounts()
                account = (OverdraftAccount) accountDAO.put(account);
              } else {
                if ( accounts.size() > 1 ) {
                  logger.warning(OverdraftAccount.class.getClass().getSimpleName(), "user", user.getId(), "multiple accounts found for denomination", denomination, "Using first found.");
                }
                account = (OverdraftAccount) accounts.get(0);
              }
            }

            return account;
          }
        `);
      }
    }
  ]
});

