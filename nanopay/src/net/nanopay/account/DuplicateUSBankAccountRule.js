foam.CLASS({
  package: 'net.nanopay.account',
  name: 'DuplicateUSBankAccountRule',
  extends: 'net.nanopay.account.DuplicateEntryRule',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.dao.ArraySink',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.USBankAccount',
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
        BankAccount newAccount = (USBankAccount) nu;
        List<BankAccount> accounts = ((ArraySink) dao
          .where(
            EQ(BankAccount.DELETED, false)
          )
          .select(new ArraySink()))
          .getArray();
        
        for ( BankAccount account : accounts ) {
          Branch curBranch = account.findBranch(x);
          if ( curBranch == null ) continue;
          String curBranchId = curBranch.getBranchId();

          if ( curBranchId == newAccount.getBranchId() ) {
            throw new RuntimeException(ERROR_MESSAGE);
          }
        }
      `
    },
  ]
});
