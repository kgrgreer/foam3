foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGeneratingDAOTest',
  extends: 'foam.nanos.test.Test',

  methods: [
    {
      name: 'runTest',
      javaCode: `
        foam.core.ClassInfo info = net.nanopay.tx.model.Transaction.getOwnClassInfo();
        foam.dao.DAO delegate = new foam.dao.MDAO(info);

        ReceiptGenerationPolicy policy = new TimeBasedReceiptGenerationPolicy.Builder(x).setInterval(10 * 1000).build();
        ReceiptGenerator generator = new MerkleTreeReceiptGenerator.Builder(x)
          .setAlgorithm("SHA-256")
          .setReceiptGenerationPolicy(policy)
          .build();
        policy.setListener(generator::build);


        ReceiptGeneratingDAO dao = new ReceiptGeneratingDAO.Builder(x)
          .setReceiptGenerator(generator)
          .setDelegate(delegate)
          .setOf(info)
          .build();
      `
    }
  ]
});
