foam.CLASS({
  package: 'net.nanopay.security',
  name: 'FileKeyStoreManagerTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'java.io.*',
    'java.util.*',
    'java.security.*',
    'java.nio.file.*',
    'java.nio.charset.Charset',
    'foam.util.SecurityUtil',
    'javax.crypto.KeyGenerator',
    'javax.crypto.SecretKey'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // constructor tests
        FileKeyStoreManager_WithDefaultPaths_Initializes();

        // path tests
        FileKeyStoreManager_RetrieveCorrectKeyStoreFileFromPath();
        FileKeyStoreManager_RetrieveCorrectPassphraseFileFromPath();

        // passphrase tests
        FileKeyStoreManager_CheckRetrievalOfPassphrase();

        // keystore tests
        FileKeyStoreManager_CheckRetrievalOfKeyStore();

        // store and load tests
        FileKeyStoreManager_CheckLoadingAndStoringOfKeys();
      `
    },
    {
      name: 'FileKeyStoreManager_WithDefaultPaths_Initializes',
      javaCode: `
        try {
          FileKeyStoreManager keyStoreManager = new FileKeyStoreManager();
          test(keyStoreManager != null, "FileKeyStoreManager initialises successfully.");
          test("/opt/nanopay/keys/keystore.jks".equals(keyStoreManager.getKeyStorePath()), "Key store path is being set correctly.");
          test("/opt/nanopay/keys/passphrase".equals(keyStoreManager.getPassphrasePath()), "Keyphrase path is being set correctly.");
        } catch ( Throwable t ) {
          test(false, "FileKeyStoreManager with default constructor should not throw an exception");
        }
      `
    },
    {
      name: 'FileKeyStoreManager_RetrieveCorrectKeyStoreFileFromPath',
      javaCode: `
        try {
          FileKeyStoreManager keyStoreManager = new FileKeyStoreManager();
          File file = new File("/opt/nanopay/keys/keystore.jks").getAbsoluteFile();
          test(keyStoreManager.getKeyStoreFile().lastModified() == file.lastModified(), "KeyStorePath retrieves the correct key store file.");

          keyStoreManager = new FileKeyStoreManager();
          keyStoreManager.setKeyStorePath("invalid path");
          keyStoreManager.getKeyStoreFile();
          test(false, "With an invalid path, getKeyStoreFile() should throw a RuntimeException.");
        } catch ( Throwable t ) {
          test(t instanceof RuntimeException, "With an invalid path, getKeyStoreFile() should throw a RuntimeException.");
        }
      `
    },
    {
      name: 'FileKeyStoreManager_RetrieveCorrectPassphraseFileFromPath',
      javaCode: `
        try {
          FileKeyStoreManager keyStoreManager = new FileKeyStoreManager();
          File file = new File("/opt/nanopay/keys/passphrase").getAbsoluteFile();
          test(keyStoreManager.getPassphraseFile().lastModified() == file.lastModified(), "KeyStorePath retrieves the correct key store file.");

          keyStoreManager = new FileKeyStoreManager();
          keyStoreManager.setPassphrasePath("invalid path");
          keyStoreManager.getPassphraseFile();
          test(false, "With an invalid path, getPassphraseFile() should throw a RuntimeException.");
        } catch ( Throwable t ) {
          test(t instanceof RuntimeException, "With an invalid path, getPassphraseFile() should throw a RuntimeException.");
        }
      `
    },
    {
      name: 'FileKeyStoreManager_CheckRetrievalOfPassphrase',
      javaCode: `
        FileKeyStoreManager keyStoreManager = new FileKeyStoreManager();
        try(BufferedReader br = new BufferedReader(new FileReader(keyStoreManager.getPassphrasePath()))) {
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

        keyStoreManager = new FileKeyStoreManager();
        keyStoreManager.setPassphrasePath("invalid path");
        try(BufferedReader br = new BufferedReader(new FileReader(keyStoreManager.getPassphrasePath()))) {
          keyStoreManager.getPassphrase();
          test(false, "With an invalid path, getPassphrase() should throw a IOException.");
        } catch ( Throwable t ) {
          test(t instanceof IOException, "With an invalid path, getPassphrase() should throw a IOException.");
        }
      `
    },
    {
      name: 'FileKeyStoreManager_CheckRetrievalOfKeyStore',
      javaCode: `
        FileKeyStoreManager keyStoreManager = new FileKeyStoreManager();

        try {
           KeyStore keyStore = KeyStore.getInstance("JCEKS");

           File keyStoreFile = keyStoreManager.getKeyStoreFile();
           char[] passphrase = keyStoreManager.getPassphrase();

           try ( FileInputStream fis = new FileInputStream(keyStoreFile) ) {
             keyStore.load(fis, passphrase);
           }

           test(keyStore.size() == keyStoreManager.getKeyStore().size(), "Keystore file correctly read and has the same number of entries.");
        } catch ( Throwable t ) {
          test(false, "KeyStoreManager getKeyStore shouldn't be throwing exceptions.");
        }

         keyStoreManager = new FileKeyStoreManager();

         //creating an invalid passphrase
         List<String> lines = Arrays.asList("invalid passphrase");
         Path file = Paths.get("/tmp/nanopay/passphrase");
         try {
           Files.write(file, lines, Charset.forName("UTF-8"));
         } catch ( Throwable t ) {
           test(false, "Error :: Cannot write to /tmp/nanopay.");
         }

         keyStoreManager.setPassphrasePath("/tmp/nanopay/passphrase");

         try{
           keyStoreManager.getKeyStore();
           test(false, "With an invalid path, getKeyStore should throw a RuntimeException.");
         } catch ( Throwable t ) {
           test(t instanceof RuntimeException, "With an invalid path, getKeyStore() should throw a RuntimeException.");
         }
      `
    },
    {
      name: 'FileKeyStoreManager_CheckLoadingAndStoringOfKeys',
      javaCode: `
        FileKeyStoreManager keyStoreManager = new FileKeyStoreManager();

        int check = 0;
        try {
          check = keyStoreManager.getKeyStore().size();
        } catch ( Throwable t ) {
          test(false, "KeyStoreManager getKeyStore shouldn't be throwing exceptions.");
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
        } catch (RuntimeException re) {
          re.printStackTrace();
          test(false, "FileKeyStoreManager storeKey should not be throwing exception with the default secret key setup.");
        } catch(NoSuchAlgorithmException nsae) {
          test(false, "Cannot generate a AES 256 key.");
        } catch ( KeyStoreException kse ) {
          test(false, "KeyStoreManager getKeyStore shouldn't be throwing exceptions.");
        }

        // retrieve secret key
        KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) keyStoreManager.loadKey("secretKeyShhh");

        if(key != null){
          test(Base64.getEncoder().encodeToString(key.getEncoded()).equals(Base64.getEncoder().encodeToString(entry.getSecretKey().getEncoded())), "Keystore retrieves the key correctly.");
        } else {
          test(false, "Secret key was not generated correctly.");
        }
      `
    }
  ]
});
