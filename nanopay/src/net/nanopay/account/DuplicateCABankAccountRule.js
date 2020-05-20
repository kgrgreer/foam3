foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DuplicateCABankAccountRule',
  extends: 'net.nanopay.account.DuplicateEntryRule',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.ArraySink',
    'foam.util.SafetyUtil',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.model.Branch',
    'net.nanopay.payment.Institution',
    'java.util.List',
    'static foam.mlang.MLang.AND',
    'static foam.mlang.MLang.EQ'
  ],

  messages: [
    { name: 'ERROR_MESSAGE', message: 'A bank account with the same details already exists' }
  ],

  methods: [
    {
      name: 'cmd',
      javaCode: `
        BankAccount newAccount = (CABankAccount) nu;
        List<BankAccount> accounts = ((ArraySink) dao
          .where(
            EQ(BankAccount.DELETED, false)
          )
          .select(new ArraySink()))
          .getArray();
        
        // Set institution number for a new account if not set
        if ( SafetyUtil.isEmpty(newAccount.getInstitutionNumber()) ) {
          Institution institution = newAccount.findInstitution(x);
          // New account doesn't have both institution and institution number
          if ( institution == null ) return;
          newAccount.setInstitutionNumber(institution.getInstitutionNumber());
        }
        
        for ( BankAccount account : accounts ) {
          Branch curBranch = account.findBranch(x);
          if ( curBranch == null ) continue;
          String curBranchId = curBranch.getBranchId();

          Institution curInstitution = curBranch.findInstitution(x);
          if ( curInstitution == null ) continue;
          String curInstNumber = curInstitution.getInstitutionNumber();

          if ( curBranchId == newAccount.getBranchId() &&
               curInstNumber == newAccount.getInstitutionNumber()
          ) {
            throw new RuntimeException(ERROR_MESSAGE);
          }
        }
      `
    },
  ]
});
