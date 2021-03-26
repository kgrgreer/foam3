/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DigitalAccount',
  extends: 'net.nanopay.account.Account',
  label: 'Virtual Account',
  documentation: 'Digital Account. Default to monetary denomination.',

  javaImports: [
    'foam.core.Currency',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.auth.Address',
    'foam.nanos.auth.Country',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'java.util.List',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.LifecycleState',
    'foam.core.ValidationException'
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
  messages: [
    { name: 'DIGITAL_ACCOUNT_LABEL', message: 'Digital Account' },
  ],

  properties: [
    {
      name: 'denomination',
      value: 'CAD',
      updateVisibility: 'RO'
    },
    {
      name: 'iban',
      class: 'Reference',
      of: 'net.nanopay.tx.IBAN',
      targetDAOKey: 'ibanDAO',
      section: 'accountInformation',
      order: 80,
      gridColumns: 6
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

  sections: [
    {
      name: 'liquiditySettingsInformation',
      title: 'Liquidity Settings',
      order: 40
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
        static public DigitalAccount findDefault(X x, User user, String currency) {
          return findDefault(x, user, currency, null, null);
        }
        static public DigitalAccount findDefault(X x, User user, String currency, String trustAccount) {

          DAO accountDAO  = (DAO) x.get("localAccountDAO");
          return (DigitalAccount) accountDAO.find(AND(
            EQ(Account.OWNER, user.getId()),
            EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
            INSTANCE_OF(DigitalAccount.class),
            EQ(Account.DENOMINATION, currency),
            EQ(Account.IS_DEFAULT, true),
            EQ(DigitalAccount.TRUST_ACCOUNT, trustAccount)
          ));
        }
        static public DigitalAccount findDefault(X x, User user, String currency, DigitalAccount instance, String trustAccount) {
          Logger logger = (Logger) x.get("logger");
          DigitalAccount account = null;

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
                denomination = ((Currency) currencies.get(0)).getId();
              } else if ( currencies.size() > 1 ) {
                logger.warning(DigitalAccount.class.getClass().getSimpleName(), "multiple currencies found for country ", address.getCountryId(), ". Defaulting to ", denomination);
              }
            }
          }
          synchronized(String.valueOf(user.getId()).intern()) {
            DAO accountDAO  = (DAO) x.get("localAccountDAO");
            account = (DigitalAccount) accountDAO
              .find(
                AND(
                  EQ(Account.OWNER, user.getId()),
                  EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE),
                  INSTANCE_OF(instance == null ? DigitalAccount.class : instance.getClass()),
                  EQ(Account.DENOMINATION, denomination),
                  EQ(Account.IS_DEFAULT, true)
                )
              );
            if ( account == null ) {
              AuthService auth = (AuthService) x.get("auth");
              if ( instance == null &&
                   ! auth.checkUser(x, user, "digitalaccount.default.create") ) {
                return account;
              }
              TrustAccount ta = null;
              if ( trustAccount != null)
                ta = (TrustAccount) accountDAO.find(trustAccount);
              else
                ta = (TrustAccount) accountDAO.find(AND(
                  INSTANCE_OF(TrustAccount.class),
                  EQ(Account.DENOMINATION, denomination),
                  EQ(Account.LIFECYCLE_STATE, LifecycleState.ACTIVE)
                ));
              if (ta == null)
                throw new ValidationException ("Trust Account with a "+denomination+" denomination is not available");

              if (! ta.getDenomination().equals(denomination) )
                throw new ValidationException ("Unable to create a "+denomination+" denominated account under a trust with denomination "+ta.getDenomination());

              account = instance == null ? new DigitalAccount() : instance;
              account.setName(DIGITAL_ACCOUNT_LABEL);
              account.setDenomination(ta.getDenomination());
              account.setIsDefault(true);
              account.setOwner(user.getId()); // required until user.getAccounts()
              account.setSpid(user.getSpid());
              account.setLifecycleState(LifecycleState.ACTIVE);
              account.setTrustAccount(ta.getId());

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
