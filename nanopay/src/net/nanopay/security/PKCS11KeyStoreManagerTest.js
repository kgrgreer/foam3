foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PKCS11KeyStoreManagerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'sun.security.pkcs11.SunPKCS11',
    'java.io.*',
    'java.nio.charset.StandardCharsets',
    'java.security.KeyStore',
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'softhsmInstalled',
      documentation: `
        This test runs using SoftHSMv2 as a software based HSM.
        This flag determines if SoftHSM is installed
      `,
      javaFactory: `
        try {
          return new ProcessBuilder("softhsm2-util", "--help").start().waitFor() == 0;
        } catch ( Throwable t ) {
          return false;
        }
      `
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // don't run if soft hsm is not installed
        if ( ! getSofthsmInstalled() ) {
          return;
        }

        try {
          // delete existing test token, ignoring errors
          new ProcessBuilder("softhsm2-util",
            "--delete-token", "--token", "PKCS11KeyStoreManagerTest")
            .inheritIO().start().waitFor();
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        try {
          // create new test token
          Process process = new ProcessBuilder("softhsm2-util",
              "--init-token", "--slot", "0",
              "--label", "PKCS11KeyStoreManagerTest",
              "--so-pin", "test",
              "--pin", "test")
            .inheritIO()
            .start();

          // wait for process to finish
          if ( process.waitFor() != 0 ) {
            throw new RuntimeException("Failed to initialize token: \\"PKCS11KeyStoreManagerTest\\"");
          }
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }

        // tests
        PKCS11KeyStoreManager_ValidConfiguration();
        PKCS11KeyStoreManager_InvalidLibrary();
        // PKCS11KeyStoreManager_InvalidPassphrase();
        PKCS11KeyStoreManager_InvalidSlotListIndex();
      `
    },
    {
      name: 'PKCS11KeyStoreManager_ValidConfiguration',
      javaCode: `
        try {
          String config = "name=SoftHSM2\\nlibrary=/usr/local/lib/softhsm/libsofthsm2.so\\nslotListIndex=0";
          SunPKCS11 provider = new SunPKCS11(new ByteArrayInputStream(config.getBytes(StandardCharsets.UTF_8)));
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider).setPassphrase("test".toCharArray())
            .build();

          KeyStore keyStore = manager.getKeyStore();
          test(keyStore != null, "Generating a PKCS11KeyStoreManager with valid configuration creates KeyStore successfully");
          test(keyStore.size() == 0, "Generating a PKCS11KeyStoreManager with valid configuration and no keys returns key size of 0");
        } catch ( Throwable t ) {
          test(false, "Generating a PKCS11KeyStoreManager with valid configuration should not throw an exception");
        }
      `
    },
    {
      name: 'PKCS11KeyStoreManager_InvalidLibrary',
      javaCode: `
        try {
          String config = "name=SoftHSM2\\nlibrary=iqnfiernf2oi4rnf2ijnrf\\nslotListIndex=0";
          SunPKCS11 provider = new SunPKCS11(new ByteArrayInputStream(config.getBytes(StandardCharsets.UTF_8)));
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider).setPassphrase("test".toCharArray())
            .build();

          KeyStore keyStore = manager.getKeyStore();
          if ( keyStore != null ) keyStore.size();
          test(false, "Generating a PKCS11KeyStoreManager with invalid configuration should throw an exception.");
        } catch ( Throwable t ) {
          test(true, "Generating a PKCS11KeyStoreManager with invalid configuration throws an exception");
        }
      `
    },
    {
      name: 'PKCS11KeyStoreManager_InvalidPassphrase',
      javaCode: `
        try {
          String config = "name=SoftHSM2\\nlibrary=/usr/local/lib/softhsm/libsofthsm2.so\\nslotListIndex=0";
          SunPKCS11 provider = new SunPKCS11(new ByteArrayInputStream(config.getBytes(StandardCharsets.UTF_8)));
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider).setPassphrase("incorrect".toCharArray())
            .build();

          KeyStore keyStore = manager.getKeyStore();
          if ( keyStore != null ) keyStore.size();
          test(false, "Generating a PKCS11KeyStoreManager with invalid passphrase should thrown an exception");
        } catch ( Throwable t ) {
          test(true, "Generating a PKCS11KeyStoreManager with invalid passphrase throws an exception");
        }
      `
    },
    {
      name: 'PKCS11KeyStoreManager_InvalidSlotListIndex',
      javaCode: `
        try {
          String config = "name=SoftHSM2\\nlibrary=/usr/local/lib/softhsm/libsofthsm2.so\\nslotListIndex=1";
          SunPKCS11 provider = new SunPKCS11(new ByteArrayInputStream(config.getBytes(StandardCharsets.UTF_8)));
          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider).setPassphrase("test".toCharArray())
            .build();

          KeyStore keyStore = manager.getKeyStore();
          if ( keyStore != null ) keyStore.size();
          test(false, "Generating a PKCS11KeyStoreManager with invalid slotListIndex should thrown an exception");
        } catch ( Throwable t ) {
          test(true, "Generating a PKCS11KeyStoreManager with invalid slotListIndex throws an exception");
        }
      `
    }
  ]
});
