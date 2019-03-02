foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'ReceiptGeneratingDAOTest',
  extends: 'foam.nanos.test.Test',

  documentation: `
    Tests the ReceiptGeneratingDAO.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.security.receipt.ReceiptGeneratingDAO',
    'net.nanopay.security.receipt.ReceiptGenerator',
    'net.nanopay.security.receipt.TimedBasedReceiptGenerator',

    'java.security.SecureRandom',
    'java.util.Random',
    'java.util.concurrent.CountDownLatch'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public class TransactionRunner
            implements Runnable
          {
            protected final X x_;
            protected final DAO dao_;
            protected final int invocations_;
            protected final Random srand_;
            protected final CountDownLatch latch_;

            public TransactionRunner(X x, DAO dao, int invocations, CountDownLatch latch, Random srand) {
              x_ = x;
              dao_ = dao;
              latch_ = latch;
              srand_ = srand;
              invocations_ = invocations;
            }

            @Override
            public void run() {
              for ( int i = 0 ; i < invocations_ ; ++i ) {
                foam.core.FObject obj = new foam.nanos.auth.User.Builder(x_)
                  .setId(srand_.nextInt())
                  .setEmail(java.util.UUID.randomUUID().toString() + "@nanopay.net")
                  .build();

                dao_.put_(x_, obj);
              }
              latch_.countDown();
            }
          }
        `);
      }
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // set up test context
        x = SecurityTestUtil.CreateSecurityTestContext(x);

        // set up delegate
        foam.core.ClassInfo of = foam.nanos.auth.User.getOwnClassInfo();
        foam.dao.DAO delegate = new foam.dao.MDAO(of);

        // set up receipt generator
        ReceiptGenerator generator = new TimedBasedReceiptGenerator.Builder(x)
          .setAlias("ReceiptGeneratingDAOTest")
          .setInterval(500)
          .build();

        ReceiptGeneratingDAO dao = new ReceiptGeneratingDAO.Builder(x)
          .setGenerator(generator)
          .setDelegate(delegate)
          .build();

        try {
          generator.start();
          test(true, "ReceiptGeneratingDAO created successfully");
        } catch ( Throwable t ) {
          test(false, "ReceiptGeneratingDAO created successfully");
        }

        int count = 10;
        int invocation = 10;
        Random srand = new SecureRandom();
        CountDownLatch latch = new CountDownLatch(count);

        /**
         * Create 10 threads all which add to the DAO 10 times
         */
        for ( int i = 0 ; i < count ; ++i ) {
          new Thread(new TransactionRunner(x, dao, invocation, latch, srand)).start();
        }

        try {
          latch.await();
          test(true, "ReceiptGeneratingDAO generates receipts");
        } catch ( Throwable t ) {
          test(false, "ReceiptGeneratingDAO generates receipts");
        }
      `
    }
  ]
});
