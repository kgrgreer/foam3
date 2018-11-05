foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGeneratingDAOTest',
  extends: 'foam.nanos.test.Test',

  documentation: `
    Tests the ReceiptGeneratingDAO.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'net.nanopay.security.KeyStoreManager',
    'net.nanopay.security.PKCS12KeyStoreManager',

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

                dao_.inX(x_).put(obj);
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
        foam.core.ClassInfo of = foam.nanos.auth.User.getOwnClassInfo();
        foam.dao.DAO delegate = new foam.dao.MDAO(of);

        // set up keystore
        try {
          KeyStoreManager manager = new PKCS12KeyStoreManager.Builder(x).build();
          manager.unlock();

          // store in context
          x = x.put("keyStoreManager", manager);
          test(true, "KeyStoreManager created successfully");
        } catch ( Throwable t ) {
          test(false, "KeyStoreManager created successfully");
        }

        ReceiptGenerator generator = new TimedBasedReceiptGenerator.Builder(x)
          .setAlias("ReceiptGeneratingDAOTest")
          .setInterval(100)
          .build();

        ReceiptGeneratingDAO dao = null;
        try {
          dao = new ReceiptGeneratingDAO.Builder(x)
            .setGenerator(generator)
            .setDelegate(delegate)
            .build();
          generator.start();
          test(true, "ReceiptGeneratingDAO created successfully");
        } catch ( Throwable t ) {
          test(false, "ReceiptGeneratingDAO created successfully");
        }

        int count = 9;
        int invocation = 9;
        Random srand = new SecureRandom();
        CountDownLatch latch = new CountDownLatch(count);

        /**
         * Create 9 threads all which add to the DAO 9 times
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
