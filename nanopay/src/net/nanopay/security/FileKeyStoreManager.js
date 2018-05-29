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
      value: '/opt/nanopay/keys/keystore.jks'
    },
    {
      class: 'Object',
      name: 'keyStoreFile',
      documentation: 'KeyStore file',
      javaType: 'java.io.File',
      javaFactory:
`File file = new File(getKeyStorePath()).getAbsoluteFile();
if ( ! file.exists() ) {
  throw new RuntimeException("KeyStore file does not exit.");
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
  throw new RuntimeException("Passphrase file does not exit.");
}
return file;`
    }
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
      name: 'getKeyStore',
      synchronized: true,
      javaCode:
`try {
  KeyStore keyStore = KeyStore.getInstance("JCEKS");

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
}`
    },
    {
      name: 'loadKey',
      synchronized: true,
      javaCode:
`try {
  KeyStore keyStore = KeyStore.getInstance("JCEKS");

  // check for keystore and passphrase file
  File keyStoreFile = getKeyStoreFile();
  char[] passphrase = getPassphrase();

  // load keystore file using password
  try ( FileInputStream fis = new FileInputStream(keyStoreFile) ) {
    keyStore.load(fis, passphrase);
  }

  return keyStore.getEntry(alias, new KeyStore.PasswordProtection(passphrase));
} catch (Throwable t) {
  throw new RuntimeException(t);
}`
    },
    {
      name: 'storeKey',
      synchronized: true,
      javaCode:
`try {
  KeyStore keyStore = KeyStore.getInstance("JCEKS");

  // check for keystore and passphrase file
  File keyStoreFile = getKeyStoreFile();
  char[] passphrase = getPassphrase();

  // load keystore file using password
  try ( FileInputStream fis = new FileInputStream(keyStoreFile) ) {
    keyStore.load(fis, passphrase);
  }

  // store key using keystore passphrase because keystore doesn't
  // allow you to store secret key entry without a passphrase
  keyStore.setEntry(alias, entry, new KeyStore.PasswordProtection(passphrase));

  // save keystore
  try (FileOutputStream fos = new FileOutputStream(keyStoreFile)) {
    keyStore.store(fos, passphrase);
  }
} catch (Throwable t) {
  throw new RuntimeException(t);
}`
    }
  ]
});