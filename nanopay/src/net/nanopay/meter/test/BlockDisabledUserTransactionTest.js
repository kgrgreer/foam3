foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'BlockDisabledUserTransactionTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'foam.test.TestUtils',
    'net.nanopay.admin.model.AccountStatus',
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
      name: 'setUserStatus',
      type: 'foam.nanos.auth.User',
      args: [
        { type: 'String', name: 'email' },
        { type: 'net.nanopay.admin.model.AccountStatus', name: 'status' }
      ],
      javaCode: `
        User user = (User) userDAO_.find(MLang.EQ(User.EMAIL, email));
        if ( user == null ) {
          user = new User.Builder(x_)
            .setEmail(email)
            .setFirstName("Francis")
            .setLastName("Filth")
            .setEmailVerified(true).build();
        } else {
          user = (User) user.fclone();
        }
        user.setStatus(status);
        return (User) userDAO_.put(user).fclone();
      `
    },
    {
      name: 'findOrCreateBankAccount',
      type: 'net.nanopay.bank.CABankAccount',
      args: [
        { type: 'foam.nanos.auth.User', name: 'user' }
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
      type: 'net.nanopay.tx.model.Transaction',
      args: [
        { type: 'foam.nanos.auth.User', name: 'sender' },
        { type: 'foam.nanos.auth.User', name: 'receiver' }
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
        User disabledUser = setUserStatus("disabled_user@nanopay.net", AccountStatus.DISABLED);
        User receiver = setUserStatus("test_user@nanopay.net", AccountStatus.ACTIVE);
        Transaction txn = buildTransaction(disabledUser, receiver);

        test(
          TestUtils.testThrows(
            () -> transactionDAO_.put(txn),
            "Unable to find a plan for requested transaction.",
            RuntimeException.class
          ),
          "Create transaction with disabled sender throws RuntimeException"
        );
      `
    },
    {
      name: 'BlockDisabledUserTransactionTest_when_receiver_is_disabled',
      javaCode: `
        User disabledUser = setUserStatus("disabled_user@nanopay.net", AccountStatus.DISABLED);
        User sender = setUserStatus("test_user@nanopay.net", AccountStatus.ACTIVE);
        Transaction txn = buildTransaction(sender, disabledUser);

        test(
          TestUtils.testThrows(
            () -> transactionDAO_.put(txn),
            "Unable to find a plan for requested transaction.",
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
