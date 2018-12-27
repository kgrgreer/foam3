foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'BlockDisabledUserTransactionTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.test.TestUtils',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x_ = x;
        setUp();
        BlockDisabledUserTransactionTest_when_sender_is_disabled();
        BlockDisabledUserTransactionTest_when_receiver_is_disabled();
      `
    },
    {
      name: 'setUp',
      javaCode: `
        // DAOs
        userDAO_ = (DAO) x_.get("localUserDAO");
        accountDAO_ = (DAO) x_.get("localAccountDAO");
        transactionDAO_ = (DAO) x_.get("transactionDAO");
      `
    },
    {
      name: 'setUserEnabled',
      javaReturns: 'User',
      args: [
        { of: 'String', name: 'email' },
        { of: 'boolean', name: 'enabled' }
      ],
      javaCode: `
        User user = (User) userDAO_.find(MLang.EQ(User.EMAIL, email));
        if ( user == null ) {
          user = new User.Builder(x_)
            .setEmail(email)
            .setEmailVerified(true).build();
        } else {
          user = (User) user.fclone();
        }
        user.setEnabled(enabled);
        return (User) userDAO_.put(user).fclone();
      `
    },
    {
      name: 'findOrCreateBankAccount',
      javaReturns: 'CABankAccount',
      args: [
        { of: 'User', name: 'user' }
      ],
      javaCode: `
        CABankAccount bankAccount = (CABankAccount) accountDAO_.find(
          MLang.AND(
            MLang.EQ(CABankAccount.OWNER, user.getId()),
            MLang.INSTANCE_OF(CABankAccount.class)));
        if ( bankAccount == null ) {
          bankAccount = new CABankAccount.Builder(x_)
            .setAccountNumber("2131412443534534")
            .setOwner(user.getId()).build();
        } else {
          bankAccount = (CABankAccount) bankAccount.fclone();
        }
        bankAccount.setStatus(BankAccountStatus.VERIFIED);
        return (CABankAccount) accountDAO_.put(bankAccount).fclone();
      `
    },
    {
      name: 'buildTransaction',
      javaReturns: 'Transaction',
      args: [
        { of: 'User', name: 'sender' },
        { of: 'User', name: 'receiver' }
      ],
      javaCode: `
        return new Transaction.Builder(x_)
          .setPayerId(sender.getId())
          .setPayeeId(receiver.getId())
          .setSourceAccount(findOrCreateBankAccount(sender).getId())
          .setDestinationAccount(findOrCreateBankAccount(receiver).getId())
          .setAmount(100l).build();
      `
    },
    {
      name: 'BlockDisabledUserTransactionTest_when_sender_is_disabled',
      javaCode: `
        User disabledUser = setUserEnabled("disabled_user@nanopay.net", false);
        User receiver = setUserEnabled("test_user@nanopay.net", true);
        Transaction txn = buildTransaction(disabledUser, receiver);

        test(
          TestUtils.testThrows(
            () -> transactionDAO_.put(txn),
            "Sender is disabled.",
            RuntimeException.class
          ),
          "Create transaction with disabled sender throws RuntimeException"
        );
      `
    },
    {
      name: 'BlockDisabledUserTransactionTest_when_receiver_is_disabled',
      javaCode: `
        User disabledUser = setUserEnabled("disabled_user@nanopay.net", false);
        User sender = setUserEnabled("test_user@nanopay.net", true);
        Transaction txn = buildTransaction(sender, disabledUser);

        test(
          TestUtils.testThrows(
            () -> transactionDAO_.put(txn),
            "Receiver is disabled.",
            RuntimeException.class
          ),
          "Create transaction with disabled receiver throws RuntimeException"
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
          private foam.dao.DAO accountDAO_;
          private foam.dao.DAO transactionDAO_;
        `);
      }
    }
  ]
});
