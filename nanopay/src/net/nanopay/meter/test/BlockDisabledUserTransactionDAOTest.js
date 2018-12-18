foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'BlockDisabledUserTransactionDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.test.TestUtils',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.tx.model.Transaction',
    'java.util.List'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x_ = x;
        setUp();
        BlockDisabledUserTransactionDAOTest_when_payer_is_disabled();
        BlockDisabledUserTransactionDAOTest_when_payee_is_disabled();
        tearDown();
      `
    },
    {
      name: 'setUp',
      javaCode: `
        // DAOs
        userDAO_ = (DAO) x_.get("localUserDAO");
        transactionDAO_ = (DAO) x_.get("transactionDAO");

        // disabled user
        disabledUser_ = new User.Builder(x_)
          .setEnabled(false)
          .setEmail("disabled@test.com")
          .setEmailVerified(true).build();
        disabledUser_ = (User) userDAO_.put(disabledUser_);
        disabledUser_.getAccounts(x_).put(
          new BankAccount.Builder(x_)
            .setName("acc")
            .setDenomination("CAD")
            .setAccountNumber("1111111")
            .setInstitution(1)
            .setBranchId("12345")
            .setStatus(BankAccountStatus.VERIFIED).build()
        );

        // user
        user_ = new User.Builder(x_)
          .setEmail("user@test.com")
          .setEmailVerified(true).build();
        user_ = (User) userDAO_.put(user_);
        user_.getAccounts(x_).put(
          new BankAccount.Builder(x_)
            .setName("acc2")
            .setDenomination("CAD")
            .setAccountNumber("2222222")
            .setInstitution(1)
            .setBranchId("12345")
            .setStatus(BankAccountStatus.VERIFIED).build()
        );
      `
    },
    {
      name: 'tearDown',
      javaCode: `
        disabledUser_.getAccounts(x_).removeAll();
        userDAO_.remove(disabledUser_);

        user_.getAccounts(x_).removeAll();
        userDAO_.remove(user_);
      `
    },
    {
      name: 'getAccount',
      javaReturns: 'Account',
      args: [
        { of: 'User', name: 'user' }
      ],
      javaCode: `
        ArraySink sink = (ArraySink) user.getAccounts(x_)
          .select(new ArraySink());
        List<Account> accounts = sink.getArray();

        return accounts.get(0);
      `
    },
    {
      name: 'BlockDisabledUserTransactionDAOTest_when_payer_is_disabled',
      javaCode: `
        Transaction txn = new Transaction.Builder(x_)
          .setPayerId(disabledUser_.getId())
          .setPayeeId(user_.getId())
          .setSourceAccount(getAccount(disabledUser_).getId())
          .setDestinationAccount(getAccount(user_).getId())
          .setAmount(1).build();

        test(
          TestUtils.testThrows(
            () -> transactionDAO_.put(txn),
            "Transaction: " + txn.getId() + " is blocked because the payer is disabled.",
            RuntimeException.class
          ),
          "Create transaction with disabled payer user throws RuntimeException"
        );
      `
    },
    {
      name: 'BlockDisabledUserTransactionDAOTest_when_payee_is_disabled',
      javaCode: `
        Transaction txn = new Transaction.Builder(x_)
          .setPayerId(user_.getId())
          .setPayeeId(disabledUser_.getId())
          .setSourceAccount(getAccount(user_).getId())
          .setDestinationAccount(getAccount(disabledUser_).getId())
          .setAmount(1).build();

        test(
          TestUtils.testThrows(
            () -> transactionDAO_.put(txn),
            "Transaction: " + txn.getId() + " is blocked because the payee is disabled.",
            RuntimeException.class
          ),
          "Create transaction with disabled payee user throws RuntimeException"
        );
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          private foam.core.X x_;
          private foam.dao.DAO userDAO_;
          private foam.dao.DAO transactionDAO_;

          private User disabledUser_;
          private User user_;
        `);
      }
    }
  ]
});
