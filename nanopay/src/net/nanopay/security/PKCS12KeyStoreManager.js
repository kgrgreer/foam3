foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PKCS12KeyStoreManager',

  documentation: 'Fetches a KeyStore from a file',

  implements: [
    'net.nanopay.security.KeyStoreManager'
  ],

  javaImports: [
    'foam.util.SecurityUtil',
    'org.bouncycastle.util.encoders.Base64',

    'java.io.*',
    'java.nio.ByteBuffer',
    'java.nio.CharBuffer',
    'java.nio.charset.StandardCharsets',
    'java.security.KeyStore'
  ],

  properties: [
    {
      class: 'String',
      name: 'keyStorePath',
      documentation: 'Path to keystore',
      value: '/opt/nanopay/keys/keystore.p12'
    },
    {
      class: 'Object',
      name: 'keyStoreFile',
      documentation: 'KeyStore file',
      javaType: 'java.io.File',
      javaFactory: `
        return new File(getKeyStorePath()).getAbsoluteFile();
      `
    },
    {
      class: 'String',
      name: 'passphrasePath',
      documentation: 'Path to passphrase.',
      value: '/opt/nanopay/keys/passphrase'
    },
    {
      class: 'Object',
      name: 'passphraseFile',
      documentation: 'Passphrase file',
      javaType: 'java.io.File',
      javaFactory: `
        return new File(getPassphrasePath()).getAbsoluteFile();
      `
    },
    {
      class: 'Object',
      name: 'keyStore',
      documentation: 'Keystore file where all of the keys are stored.',
      javaType: 'java.security.KeyStore',
      javaFactory: `
        try {
          KeyStore keyStore = KeyStore.getInstance("PKCS12");

          // check for keystore and passphrase file
          File keyStoreFile = getKeyStoreFile();
          char[] passphrase = getPassphrase();

          // load keystore file using password
          try ( FileInputStream fis = new FileInputStream(keyStoreFile) ) {
            keyStore.load(fis, passphrase);
          }

          return keyStore;
        } catch (Throwable t) {
          throw new RuntimeException(t);
        }
      `
    },
  ],

  methods: [
    {
      name: 'getPassphrase',
      javaReturns: 'char[]',
      javaThrows: [
        'java.io.IOException'
      ],
      javaCode: `
        char[] cbuffer = new char[32];
        File passphraseFile = getPassphraseFile();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
          new FileInputStream(passphraseFile), StandardCharsets.UTF_8))) {
          reader.read(cbuffer, 0, 32);
        }

        return cbuffer;
      `
    },
    {
      name: 'loadKey',
      synchronized: true,
      javaCode: `
        try {
          return getKeyStore().getEntry(alias, new KeyStore.PasswordProtection(getPassphrase()));
        } catch (Throwable t) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'storeKey',
      synchronized: true,
      javaCode: `
        try {
          // store key using keystore passphrase because keystore doesn't
          // allow you to store secret key entry without a passphrase
          KeyStore keyStore = getKeyStore();
          keyStore.setEntry(alias, entry, new KeyStore.PasswordProtection(getPassphrase()));

          // save keystore
          try (FileOutputStream fos = new FileOutputStream(getKeyStoreFile())) {
            keyStore.store(fos, getPassphrase());
          }
        } catch (Throwable t) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
