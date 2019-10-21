foam.CLASS({
  package: 'net.nanopay.account',
  name: 'TrustAccount',
  extends: 'net.nanopay.account.ZeroAccount',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Currency',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.INSTANCE_OF',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'java.util.List',
    'net.nanopay.payment.Institution'
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
          static public DAO find(X x, User sourceUser, String currency) {
            Logger logger   = (Logger) x.get("logger");
            ServiceProvider spid = sourceUser.findSpid(x) == null ? (ServiceProvider) ((DAO) x.get("serviceProviderDAO")).find("nanopay") : sourceUser.findSpid(x);
            User user = zeroAccountUser(x, spid , currency);

            DAO accounts = ((DAO)x.get("localAccountDAO"))
                            .where(
                              AND(
                                INSTANCE_OF(TrustAccount.class),
                                EQ(Account.ENABLED, true),
                                EQ(Account.OWNER, user.getId()),
                                EQ(Account.DENOMINATION, currency)
                              )
                            );
                        //    .select(new ArraySink())).getArray();
            Count count = new Count();
            count = (Count) accounts.select(count);
            if ( count.getValue() == 0 ) {
              logger.error("No TrustAccounts found for ", user.getId());
              throw new RuntimeException("No TrustAccounts found for "+user.getId());
            }
            return accounts;
          }

          static public TrustAccount find(X x, Account account) {
            DAO accounts = find(x, account.findOwner(x), account.getDenomination());
            return (TrustAccount) ( (ArraySink) accounts.select(new ArraySink())).getArray().get(0);
          }

          static public TrustAccount find(X x, Account account, String institutionNumber) {
            if ( SafetyUtil.isEmpty(institutionNumber) ) {
              return find(x,account);
            }

            DAO accounts = find(x, account.findOwner(x), account.getDenomination());
            List accountList = ((ArraySink)accounts.select(new ArraySink())).getArray();
            DAO reserveAccs = new MDAO(Account.getOwnClassInfo());

            for ( int i =0 ; i<accountList.size(); i++ ) {
              reserveAccs.put( ( (TrustAccount) accountList.get(i) ).findReserveAccount(x) );
            }
            Institution institution = (Institution) ((DAO) x.get("institutionDAO")).find(EQ(Institution.INSTITUTION_NUMBER,institutionNumber));
            List reserveAccsList = ( (ArraySink) reserveAccs.where(
              AND(
                INSTANCE_OF(BankAccount.class),
                EQ(BankAccount.INSTITUTION,institution.getId())
              )
            ).select(new ArraySink())).getArray();
            accountList = ((ArraySink) accounts.where(
              EQ(TrustAccount.RESERVE_ACCOUNT,((BankAccount) reserveAccsList.get(0)).getId())
            ).select(new ArraySink())).getArray();

            if ( accountList.size() > 1 ) {
              logger.error("ERROR, Multiple Trust accounts found for institution: " + institutionNumber);
              throw new RuntimeException("Multiple Trust accounts found for institution: " + institutionNumber);
            }
            if ( accountList.size() == 0 ) {
              logger.error("Trust account not found for institution: " + institutionNumber);
              throw new RuntimeException("Trust account not found for institution: "+ institutionNumber);
            }
            return (TrustAccount) accountList.get(0);
          }

          static public TrustAccount find(X x, User sourceUser, Currency currency) {
            DAO accounts = find(x, sourceUser, currency.getAlphabeticCode());
            return (TrustAccount) ((ArraySink) accounts.select(new ArraySink())).getArray().get(0);
          }
      `);
      }
    }
  ]
});
