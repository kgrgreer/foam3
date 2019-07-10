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

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'net.nanopay.account.DebtAccount'
  ],

  imports: [
    'accountDAO',
    'debtAccountDAO'
  ],

  properties: [
    {
      class: 'String',
      name: 'denomination',
      aliases: ['currencyCode', 'currency'],
      value: 'CAD',
      section: 'accountDetails'
    }
  ],

  actions: [
    {
      name: 'viewExposure',
      isAvailable: async function() {
        var account = await this.debtAccountDAO.find(this.EQ(this.DebtAccount.CREDITOR_ACCOUNT, this.id));
        return (account != null);
      },
      code: function(X) {
        X.stack.push({ class: 'net.nanopay.tx.ui.exposure.ExposureOverview', data: this });
      }
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
        static public DigitalAccount findDefault(X x, User user, String currency) {
          return findDefault(x, user, currency, null);
        }
        static public DigitalAccount findDefault(X x, User user, String currency, DigitalAccount instance) {
          Logger logger = (Logger) x.get("logger");
          DigitalAccount account;
          // Select currency of user's country.
          String denomination = currency;
          if ( denomination == null ) {
            denomination = "CAD";
            Address address = user.getAddress();
            if ( address != null && address.getCountryId() != null ) {
              String country = address.getCountryId();
              DAO currencyDAO = (DAO) x.get("currencyDAO");
              List currencies = ((ArraySink) currencyDAO
                .where(EQ(Currency.COUNTRY, country)).limit(2)
                .select(new ArraySink())).getArray();
              if ( currencies.size() == 1 ) {
                denomination = ((Currency) currencies.get(0)).getAlphabeticCode();
              } else if ( currencies.size() > 1 ) {
                logger.warning(DigitalAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
              }
            }
          }
          synchronized(String.valueOf(user.getId()).intern()) {
            DAO accountDAO  = ((DAO) x.get("localAccountDAO")).where(EQ(Account.OWNER, user.getId()));
            account = (DigitalAccount) accountDAO
              .find(
                AND(
                  EQ(Account.ENABLED, true),
                  INSTANCE_OF(instance == null ? DigitalAccount.class : instance.getClass()),
                  EQ(Account.DENOMINATION, denomination),
                  EQ(Account.IS_DEFAULT, true)
                )
              );
            if ( account == null ) {
              account = instance == null ? new DigitalAccount() : instance;
              account.setDenomination(denomination);
              account.setIsDefault(true);
              account.setOwner(user.getId()); // required until user.getAccounts()
              account = (DigitalAccount) accountDAO.put(account);
            }
          }
          return account;
        }
        `);
      }
    }
  ]
});
