foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PKCS11KeyStoreManagerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'sun.security.pkcs11.SunPKCS11',

    'java.io.*',
    'java.nio.charset.StandardCharsets',
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
          Process process = new ProcessBuilder("softhsm2-util",
              "--delete-token", "--token", "PKCS11KeyStoreManagerTest")
            .start();
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

        PKCS11KeyStoreManager_ValidPKCS11ConfigFile();
      `
    },

    {
      name: 'PKCS11KeyStoreManager_ValidPKCS11ConfigFile',
      javaCode: `
        try {
          String config = "name=SoftHSM2\\nlibrary=/usr/local/lib/softhsm/libsofthsm2.so\\nslotListIndex=0";
          SunPKCS11 provider = new SunPKCS11(new ByteArrayInputStream(config.getBytes(StandardCharsets.UTF_8)));

          PKCS11KeyStoreManager manager = new PKCS11KeyStoreManager.Builder(getX())
            .setProvider(provider).setPassphrase("test".toCharArray())
            .build();

          test(manager.getKeyStore() != null, "Generating a PKCS11KeyStoreManager with valid configuration creates KeyStore successfully");
        } catch ( Throwable t ) {
          t.printStackTrace();
          test(false, "Generating a PKCS11KeyStoreManager with valid configuration should not throw an exception");
        }
      `
    }
  ]
});
