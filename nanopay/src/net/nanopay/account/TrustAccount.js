foam.CLASS({
  package: 'net.nanopay.account',
  name: 'TrustAccount',
  extends: 'net.nanopay.account.ZeroAccount',

  javaImports: [
    'foam.core.Currency',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.GT',
    'static foam.mlang.MLang.IN',
    'static foam.mlang.MLang.INSTANCE_OF',
    'static foam.mlang.MLang.OR',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'java.util.Arrays',
    'java.util.List',
    'java.util.stream.Collectors'
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
            ServiceProvider spid = sourceUser.findSpid(x) == null ? (ServiceProvider) ((DAO) x.get("localServiceProviderDAO")).find("nanopay") : sourceUser.findSpid(x);
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
              logger.error("TrustAccounts not found for ", user.getId());
              throw new RuntimeException("TrustAccounts not found for "+user.getId()+ " currency: "+ currency);
            }
            return accounts;
          }

          static public TrustAccount find(X x, Account account) {
            DAO accounts = find(x, account.findOwner(x), account.getDenomination());
            return (TrustAccount) ( (ArraySink) accounts.select(new ArraySink())).getArray().get(0);
          }

          static public TrustAccount find(X x, Account account, String institutionNumber) {
            Logger logger   = (Logger) x.get("logger");

            logger.info("TrustAccount.find", "account", account, "institution", institutionNumber);
            if ( SafetyUtil.isEmpty(institutionNumber) ) {
              return find(x,account);
            }

            Institution institution = (Institution) ((DAO) x.get("institutionDAO")).find(EQ(Institution.INSTITUTION_NUMBER,institutionNumber));
            List<Branch> branches = ((ArraySink) institution.getBranches(x).select(new ArraySink())).getArray();
            Long[] branchIds = branches.stream().map(Branch::getId).collect(Collectors.toList()).toArray(new Long[0]);

            DAO trustAccountsDAO = find(x, account.findOwner(x), account.getDenomination());

            Predicate p =
                AND(
                  INSTANCE_OF(BankAccount.class),
                  EQ(Account.ENABLED, true),
                  EQ(Account.DENOMINATION, account.getDenomination())
                );
            if ( branchIds.length > 0 ) {
              p = AND(
                    p,
                    IN(BankAccount.BRANCH, branchIds)
                  );
            } else {
              p = AND(
                    p,
                    EQ(BankAccount.INSTITUTION, institution.getId())
                  );
            }

            List<BankAccount> bankAccounts = ((ArraySink) ((DAO) x.get("localAccountDAO"))
              .where(p)
              .select(new ArraySink())).getArray();

            Long[] bankAccountIds = bankAccounts.stream().map(Account::getId).collect(Collectors.toList()).toArray(new Long[0]);

            List<TrustAccount> trustAccounts = ((ArraySink) trustAccountsDAO
              .where(
                IN(TrustAccount.RESERVE_ACCOUNT, bankAccountIds)
              )
              .select(new ArraySink())).getArray();

            if ( trustAccounts.size() == 0 ) {
              logger.error("TrustAccount with ReserveAccount not found. institution", institution.getId(), "branches", Arrays.toString(branchIds), "banks", Arrays.toString(bankAccountIds));
              throw new RuntimeException("TrustAccount with ReserveAccount not found.");
            }
            if ( trustAccounts.size() > 1 ) {
              logger.error("ERROR, Multiple TrustAccounts with ReserveAccount found. institution", institution.getInstitutionNumber(), "branches", Arrays.toString(branchIds), "banks", Arrays.toString(bankAccountIds));
              throw new RuntimeException("Multiple TrustAccounts with ReserveAccount found.");
            }
            return trustAccounts.get(0);
          }

          static public TrustAccount find(X x, User sourceUser, Currency currency) {
            DAO accounts = find(x, sourceUser, currency.getId());
            return (TrustAccount) ((ArraySink) accounts.select(new ArraySink())).getArray().get(0);
          }
      `);
      }
    }
  ]
});
