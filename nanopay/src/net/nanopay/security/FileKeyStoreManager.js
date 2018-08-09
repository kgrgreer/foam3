foam.CLASS({
  package: 'net.nanopay.security',
  name: 'FileKeyStoreManager',

  documentation: 'Fetches a KeyStore from a file',

  implements: [
    'net.nanopay.security.KeyStoreManager'
  ],

  javaImports: [
    'java.io.*',
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
      javaFactory:
`File file = new File(getKeyStorePath()).getAbsoluteFile();
if ( ! file.exists() ) {
  throw new RuntimeException("KeyStore file does not exist.");
}
return file;`
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
      javaFactory:
`File file = new File(getPassphrasePath()).getAbsoluteFile();
if ( ! file.exists() ) {
  throw new RuntimeException("Passphrase file does not exist.");
}
return file;`
    },
    {
      class: 'Object',
      name: 'keyStore',
      documentation: 'Keystore file where all of the keys are stored.',
      javaType: 'java.security.KeyStore',
      javaFactory:
`try {
  KeyStore keyStore = KeyStore.getInstance("PKCS12");

  // check for keystore and passphrase file
  File keyStoreFile = getKeyStoreFile();
  char[] passphrase = getPassphrase();

  if ( ! keyStoreFile.exists() || keyStoreFile.length() == 0 ) {
    // create keystore file using password
    try ( FileOutputStream fos = new FileOutputStream(keyStoreFile) ) {
      // keystore must be "loaded" before it can be created
      keyStore.load(null, passphrase);
      keyStore.store(fos, passphrase);
    }
  } else {
    // load keystore file using password
    try ( FileInputStream fis = new FileInputStream(keyStoreFile) ) {
      keyStore.load(fis, passphrase);
    }
  }

  return keyStore;
} catch (Throwable t) {
  throw new RuntimeException(t);
}`
    },
  ],

  methods: [
    {
      name: 'getPassphrase',
      javaReturns: 'char[]',
      javaThrows: [
        'java.io.IOException'
      ],
      javaCode:
`File passphraseFile = getPassphraseFile();
CharBuffer buffer = CharBuffer.allocate(32);
try (BufferedReader reader = new BufferedReader(new InputStreamReader(
    new FileInputStream(passphraseFile), StandardCharsets.UTF_8))) {
  reader.read(buffer);
}
return buffer.array();`
    },
    {
      name: 'loadKey',
      synchronized: true,
      javaCode:
`try {
  return getKeyStore().getEntry(alias, new KeyStore.PasswordProtection(getPassphrase()));
} catch (Throwable t) {
  throw new RuntimeException(t);
}`
    },
    {
      name: 'storeKey',
      synchronized: true,
      javaCode:
`try {
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
}`
    }
  ]
});
