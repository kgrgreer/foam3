foam.CLASS({
  package: 'net.nanopay.account',
  name: 'PreventDuplicateBankAccountRule',

  documentation: `This Rule prevents the adding of duplicate bank accounts based 
  on the account owner, account number, denomination, branch,and instition number`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.DAO',
    'static foam.mlang.MLang.*',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.payment.Institution',
    'net.nanopay.model.Branch',
    'foam.dao.ArraySink',
    'java.util.List'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( ! ( obj instanceof BankAccount ) ) return;
        BankAccount newAccount = (BankAccount) obj;
        ArraySink bankAccounts = (ArraySink) ((DAO) x.get("localAccountDAO"))
        .where(
              AND(
                INSTANCE_OF(BankAccount.class),
                EQ(BankAccount.OWNER, newAccount.getOwner()),
                EQ(BankAccount.DELETED, false),
                EQ(BankAccount.DENOMINATION, newAccount.getDenomination()),
                EQ(BankAccount.ACCOUNT_NUMBER, newAccount.getAccountNumber())
                )
              )
        .select(new ArraySink());
        List<BankAccount> newVar = bankAccounts.getArray();
        if ( newVar.size() == 0 ) return;
        for ( BankAccount bankAccount :  newVar ) {
          Branch branch = bankAccount.findBranch(x);
          if ( branch != null && branch.getBranchId() == newAccount.getBranchId() ) {
            Institution institution = branch.findInstitution(x);
            if ( institution.getInstitutionNumber() == newAccount.getInstitutionNumber() ) {
              throw new RuntimeException("Bank account with same details already registered");
            }
          }
        }
      `
    }
  ]
});
