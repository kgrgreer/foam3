foam.CLASS({
  package: 'net.nanopay.meter.test',
  name: 'BlockDisabledUserInvoiceDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.test.TestUtils',
    'net.nanopay.account.Account',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.invoice.model.Invoice',
    'java.util.List'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x_ = x;
        setUp();
        BlockDisabledUserInvoiceDAOTest_when_payer_is_disabled();
        BlockDisabledUserInvoiceDAOTest_when_payee_is_disabled();
        tearDown();
      `
    },
    {
      name: 'setUp',
      javaCode: `
        // DAOs
        userDAO_ = (DAO) x_.get("localUserDAO");
        invoiceDAO_ = (DAO) x_.get("invoiceDAO");

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
      name: 'tearDown',
      javaCode: `
        userDAO_.remove(disabledUser_);
        userDAO_.remove(user_);
      `
    },
    {
      name: 'BlockDisabledUserInvoiceDAOTest_when_payer_is_disabled',
      javaCode: `
        Invoice invoice = new Invoice.Builder(x_)
          .setPayerId(disabledUser_.getId())
          .setPayeeId(user_.getId())
          .setAccount(getAccount(disabledUser_).getId())
          .setSourceCurrency("CAD")
          .setDestinationCurrency("CAD")
          .setAmount(1).build();

        test(
          TestUtils.testThrows(
            () -> invoiceDAO_.put(invoice),
            "Invoice: " + invoice.getId() + " is blocked because the payer is disabled.",
            RuntimeException.class
          ),
          "Create invoice with disabled payer user throws RuntimeException"
        );
      `
    },
    {
      name: 'BlockDisabledUserInvoiceDAOTest_when_payee_is_disabled',
      javaCode: `
        Invoice invoice = new Invoice.Builder(x_)
          .setPayerId(user_.getId())
          .setPayeeId(disabledUser_.getId())
          .setAccount(getAccount(user_).getId())
          .setSourceCurrency("CAD")
          .setDestinationCurrency("CAD")
          .setAmount(1).build();

        test(
          TestUtils.testThrows(
            () -> invoiceDAO_.put(invoice),
            "Invoice: " + invoice.getId() + " is blocked because the payee is disabled.",
            RuntimeException.class
          ),
          "Create invoice with disabled payee user throws RuntimeException"
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
          private foam.dao.DAO invoiceDAO_;

          private User disabledUser_;
          private User user_;
        `);
      }
    }
  ]
});
