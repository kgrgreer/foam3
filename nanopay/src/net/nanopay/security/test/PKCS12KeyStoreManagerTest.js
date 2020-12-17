/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.security.test',
  name: 'PKCS12KeyStoreManagerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'java.io.*',
    'java.nio.charset.StandardCharsets',
    'java.security.*',
    'java.nio.file.*',
    'java.nio.charset.Charset',
    'java.util.Arrays',
    'java.util.List',
    'foam.util.SecurityUtil',
    'net.nanopay.security.PKCS12KeyStoreManager',
    'org.bouncycastle.util.encoders.Base64',
    'javax.crypto.KeyGenerator',
    'javax.crypto.SecretKey'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // test setup
        try {
          char[] passphrase = new char[32];
          File passphraseFile = new File("/tmp/nanopay/var/keys/passphrase");

          // delete existing passphrase file
          if ( passphraseFile.exists() ) {
            if ( !passphraseFile.delete() ) {
              throw new IOException("Delete file failed!");
            }
          }

          // create new passphrase
          if ( ! passphraseFile.exists() ) {
            passphraseFile.getParentFile().mkdirs();
            passphraseFile.deleteOnExit();

            // create passphrase file
            byte[] bbuffer = new byte[24];
            SecurityUtil.GetSecureRandom().nextBytes(bbuffer);

            bbuffer = Base64.encode(bbuffer);
            for (int i = 0; i < bbuffer.length; i++) {
              passphrase[i] = (char) bbuffer[i];
            }

            try ( BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(
              new FileOutputStream(passphraseFile), StandardCharsets.UTF_8)) ) {
              writer.write(passphrase, 0, 32);
            }
          }

          File keyStoreFile = new File("/tmp/nanopay/var/keys/keystore.p12");

          // delete existing keystore file
          if ( keyStoreFile.exists() ) {
            if ( !keyStoreFile.delete() ) {
              throw new IOException("Delete keystore file failed!");
            }
          }

          if ( ! keyStoreFile.exists() ) {
            KeyStore keyStore = KeyStore.getInstance("PKCS12");
            keyStoreFile.getParentFile().mkdirs();
            keyStoreFile.deleteOnExit();

            try ( FileOutputStream fos = new FileOutputStream(keyStoreFile) ) {
              keyStore.load(null, passphrase);
              keyStore.store(fos, passphrase);
            }
          }
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }


        // constructor tests
        PKCS12KeyStoreManager_WithDefaultPaths_Initializes();

        // path tests
        PKCS12KeyStoreManager_RetrieveCorrectKeyStoreFileFromPath();
        PKCS12KeyStoreManager_RetrieveCorrectPassphraseFileFromPath();

        // passphrase tests
        PKCS12KeyStoreManager_CheckRetrievalOfPassphrase();

        // keystore tests
        PKCS12KeyStoreManager_CheckRetrievalOfKeyStore();

        // store and load tests
        PKCS12KeyStoreManager_CheckLoadingAndStoringOfKeys();
      `
    },
    {
      name: 'PKCS12KeyStoreManager_WithDefaultPaths_Initializes',
      javaCode: `
        try {
          PKCS12KeyStoreManager keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
            .setKeyStorePath("/tmp/nanopay/var/keys/keystore.p12")
            .setPassphrasePath("/tmp/nanopay/var/keys/passphrase")
            .build();

          test("/tmp/nanopay/var/keys/keystore.p12".equals(keyStoreManager.getKeyStorePath()), "Key store path is being set correctly.");
          test("/tmp/nanopay/var/keys/passphrase".equals(keyStoreManager.getPassphrasePath()), "Keyphrase path is being set correctly.");
        } catch ( Throwable t ) {
          test(false, "PKCS12KeyStoreManager with default constructor should not throw an exception");
        }
      `
    },
    {
      name: 'PKCS12KeyStoreManager_RetrieveCorrectKeyStoreFileFromPath',
      javaCode: `
        try {
          PKCS12KeyStoreManager keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
            .setKeyStorePath("/tmp/nanopay/var/keys/keystore.p12")
            .setPassphrasePath("/tmp/nanopay/var/keys/passphrase")
            .build();

          File file = new File("/tmp/nanopay/var/keys/keystore.p12").getAbsoluteFile();
          test(keyStoreManager.getKeyStoreFile().lastModified() == file.lastModified(), "KeyStorePath retrieves the correct key store file.");

          keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
              .setKeyStorePath("Invalid path")
              .build();

          test(! keyStoreManager.getKeyStoreFile().exists(), "With an invalid path, getKeyStoreFile() should return a file that does not exist.");
        } catch ( Throwable t ) {
          test(false, "With an invalid path, getKeyStoreFile() should not throw a RuntimeException.");
        }
      `
    },
    {
      name: 'PKCS12KeyStoreManager_RetrieveCorrectPassphraseFileFromPath',
      javaCode: `
        try {
          PKCS12KeyStoreManager keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
            .setKeyStorePath("/tmp/nanopay/var/keys/keystore.p12")
            .setPassphrasePath("/tmp/nanopay/var/keys/passphrase")
            .build();

          File file = new File("/tmp/nanopay/var/keys/passphrase").getAbsoluteFile();
          test(keyStoreManager.getPassphraseFile().lastModified() == file.lastModified(), "KeyStorePath retrieves the correct key store file.");

          keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
              .setPassphrasePath("Invalid path")
              .build();

          test(! keyStoreManager.getPassphraseFile().exists(), "With an invalid path, getPassphraseFile() should return a file that does not exists.");
        } catch ( Throwable t ) {
          test(false, "With an invalid path, getPassphraseFile() should not throw a RuntimeException.");
        }
      `
    },
    {
      name: 'PKCS12KeyStoreManager_CheckRetrievalOfPassphrase',
      javaCode: `
        PKCS12KeyStoreManager keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
          .setKeyStorePath("/tmp/nanopay/var/keys/keystore.p12")
          .setPassphrasePath("/tmp/nanopay/var/keys/passphrase")
          .build();

        try ( BufferedReader br = new BufferedReader(new FileReader(keyStoreManager.getPassphrasePath())) ) {
          StringBuilder sb1 = new StringBuilder();
          String line = br.readLine();
          while (line != null) {
              sb1.append(line);
              line = br.readLine();
          }
          String testPassphrase = sb1.toString();

          StringBuilder sb2 = new StringBuilder();
          for(char s : keyStoreManager.getPassphrase()) {
              sb2.append(Character.toString(s));
          }
          String passphrase = sb2.toString();

          test(testPassphrase.equals(passphrase), "Passphrase read is correct.");
        } catch ( Throwable t ) {
          test(false, "KeyStoreManager getPassphrase shouldn't be throwing exceptions.");
        }

        keyStoreManager = new PKCS12KeyStoreManager.Builder(getX()).setPassphrasePath("invalid path").build();
        try( BufferedReader br = new BufferedReader(new FileReader(keyStoreManager.getPassphrasePath())) ) {
          keyStoreManager.getPassphrase();
          test(false, "With an invalid path, getPassphrase should throw an Exception.");
        } catch ( Throwable t ) {
          test(true, "With an invalid path, getPassphrase throws an Exception.");
        }
      `
    },
    {
      name: 'PKCS12KeyStoreManager_CheckRetrievalOfKeyStore',
      javaCode: `
        PKCS12KeyStoreManager keyStoreManager = null;

        try {
          keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
            .setKeyStorePath("/tmp/nanopay/var/keys/keystore.p12")
            .setPassphrasePath("/tmp/nanopay/var/keys/passphrase")
            .build();
          keyStoreManager.unlock();

          KeyStore keyStore = KeyStore.getInstance("PKCS12");

          File keyStoreFile = keyStoreManager.getKeyStoreFile();
          char[] passphrase = keyStoreManager.getPassphrase();

          try ( FileInputStream fis = new FileInputStream(keyStoreFile) ) {
            keyStore.load(fis, passphrase);
          }

          test(keyStore.size() == keyStoreManager.getKeyStore().size(), "Keystore file correctly read and has the same number of entries.");
        } catch ( Throwable t ) {
          test(false, "KeyStoreManager getKeyStore shouldn't be throwing exceptions.");
        }

        //creating an invalid passphrase
        List<String> lines = Arrays.asList("invalid passphrase");
        Path file = Paths.get("/tmp/nanopay/passphrase");
        try {
          Files.write(file, lines, Charset.forName("UTF-8"));
        } catch ( Throwable t ) {
          test(false, "Error :: Cannot write to /tmp/nanopay.");
        }

        try {
          keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
            .setPassphrasePath("/tmp/nanopay/passphrase")
            .build();
          keyStoreManager.unlock();

          test(false, "With an invalid path, unlock should throw a RuntimeException.");
        } catch ( Throwable t ) {
          test(true, "With an invalid path, getKeyStore throws an Exception.");
        }
      `
    },
    {
      name: 'PKCS12KeyStoreManager_CheckLoadingAndStoringOfKeys',
      javaCode: `
        PKCS12KeyStoreManager keyStoreManager = null;

        int check = 0;
        try {
          keyStoreManager = new PKCS12KeyStoreManager.Builder(getX())
            .setKeyStorePath("/tmp/nanopay/var/keys/keystore.p12")
            .setPassphrasePath("/tmp/nanopay/var/keys/passphrase")
            .build();
          keyStoreManager.unlock();

          check = keyStoreManager.getKeyStore().size();
        } catch ( Throwable t ) {
          test(false, "KeyStoreManager getKeyStore shouldn't be throwing exceptions.");
        }
        if ( keyStoreManager == null ) {
          test(false, "KeyStoreManager getKeyStore shouldn't be null"); 
          return;
        }

        SecretKey key = null;
        try {
          // generate secret key
          KeyGenerator keygen = KeyGenerator.getInstance("AES");
          keygen.init(256, SecurityUtil.GetSecureRandom());

          // store secret key
          key = keygen.generateKey();
          keyStoreManager.storeKey("secretKeyShhh", new KeyStore.SecretKeyEntry(key));

          test((check+1) == keyStoreManager.getKeyStore().size(), "Keystore stores keys correctly.");
        } catch ( Throwable t ) {
          test(false, "KeyStoreManager getKeyStore shouldn't be throwing exceptions.");
        }

        // retrieve secret key
        try {
          KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) keyStoreManager.loadKey("secretKeyShhh");
          test(key != null && Base64.toBase64String(key.getEncoded()).equals(Base64.toBase64String(entry.getSecretKey().getEncoded())), "Keystore retrieves the key correctly.");
        } catch ( Throwable t ) {
          test(false, "KeyStoreManager loadKey shouldn't be throwing exceptions");
        }
      `
    }
  ]
});
