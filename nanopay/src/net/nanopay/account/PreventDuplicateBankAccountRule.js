foam.CLASS({
  package: 'net.nanopay.account',
  name: 'PreventDuplicateBankAccountRule',

  documentation: `This Rule prevents the adding of duplicate bank accounts based 
  on the account owner, account number, denomination, branch,and instition number`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.sink.Count',
    'static foam.mlang.MLang.*',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.payment.Institution',
    'net.nanopay.model.Branch'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      BankAccount account = (BankAccount) obj;
      Count count = new Count();
      DAO institutionDAO = (DAO) x.get("institutionDAO");
      DAO branchDAO = (DAO) x.get("branchDAO");

      Institution institution = (Institution)  institutionDAO
        .find(
          EQ(Institution.INSTITUTION_NUMBER, account.getInstitutionNumber())
        );

      Branch branch = (Branch) branchDAO
        .find(
          EQ(Branch.BRANCH_ID, account.getBranchId())
        );
      if ( branch == null || institution == null ) return;
      count = (Count) ((DAO) x.get("localAccountDAO"))
        .where(
              AND(
                INSTANCE_OF(BankAccount.class),
                EQ(BankAccount.ENABLED, true),
                EQ(BankAccount.OWNER, account.getOwner()),
                EQ(BankAccount.DELETED, false),
                EQ(BankAccount.BRANCH, branch.getId()),
                EQ(BankAccount.DENOMINATION, account.getDenomination()),
                EQ(BankAccount.ACCOUNT_NUMBER, account.getAccountNumber()),
                EQ(BankAccount.INSTITUTION, institution.getId())
                  )
              )
        .select(count); 
      if ( count.getValue() > 0 ) {
        throw new RuntimeException("Bank account with same details already registered");
      }
      `
    }
  ]
});
