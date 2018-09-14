foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PayerAssentTransactionDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // set up test context
        x = SecurityTestUtil.CreateSecurityTestContext(x);

        // create user key pair generation dao
        foam.dao.DAO userKeyPairGenerationDAO = new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x)
          .setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo()))
          .build();

        // create payer assent transaction dao
        foam.dao.DAO payerAssentTransactionDAO = new PayerAssentTransactionDAO.Builder(x)
          .setDelegate(new foam.dao.MDAO(net.nanopay.tx.model.Transaction.getOwnClassInfo()))
          .build();

        // create user
        foam.nanos.auth.User user = new foam.nanos.auth.User.Builder(x)
          .setId(1000)
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@nanopay.net")
          .build();

        net.nanopay.tx.model.Transaction tx = new net.nanopay.tx.model.Transaction.Builder(x)
          .setId(java.util.UUID.randomUUID().toString())
          .setPayerId(1000)
          .setPayeeId(1001)
          .setAmount(10000)
          .build();

        // authenticate as user
        x = foam.util.Auth.sudo(x, user);

        // put to user key pair generation dao to create keys
        userKeyPairGenerationDAO.put_(x, user);

        // put to the payer assent transaction dao to sign transaction
        tx = (net.nanopay.tx.model.Transaction) payerAssentTransactionDAO.put_(x, tx);

        // verify signature added
        test(tx != null, "Transaction is not null");
        test(tx.getSignatures() != null, "Transaction signatures is not null");
        test(tx.getSignatures().size() == 1, "Transaction has one signature");
      `
    }
  ]
});
