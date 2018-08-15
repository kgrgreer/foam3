foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PKCS11KeyStoreManager',
  extends: 'net.nanopay.security.AbstractKeyStoreManager',

  documentation: 'KeyStore that uses PKCS #11 as the API',

  javaImports: [
    'sun.security.pkcs11.SunPKCS11',

    'java.io.BufferedReader',
    'java.io.File',
    'java.io.FileInputStream',
    'java.io.InputStreamReader',
    'java.nio.charset.StandardCharsets',
    'java.security.KeyStore'
  ],

  properties: [
    {
      class: 'String',
      name: 'config',
      documentation: 'Path to configuration file for PKCS#11 interface.',
      value: '/opt/nanopay/keys/pkcs11.cfg'
    },
    {
      class: 'Object',
      name: 'provider',
      documentation: 'KeyStore crypto provider',
      javaType: 'java.security.Provider',
      javaFactory: `
        return new SunPKCS11(getConfig());
      `
    },
    {
      class: 'String',
      name: 'passphrasePath',
      documentation: 'Path to passphrase file.'
    },
    {
      class: 'Object',
      name: 'passphraseFile',
      transient: true,
      javaType: 'java.io.File',
      javaFactory: `
        return new File(getPassphrasePath()).getAbsoluteFile();
      `
    },
    {
      class: 'Object',
      name: 'passphrase',
      transient: true,
      javaType: 'char[]',
      javaFactory: `
        try {
          StringBuilder builder = new StringBuilder();
          File passphraseFile = getPassphraseFile();

          try ( BufferedReader reader = new BufferedReader(new InputStreamReader(
            new FileInputStream(passphraseFile), StandardCharsets.UTF_8)) ) {
            String line;
            while ( (line = reader.readLine()) != null ) {
              builder.append(line);
            }
          }

          return builder.toString().toCharArray();
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      class: 'Object',
      name: 'keyStore',
      transient: true,
      javaType: 'java.security.KeyStore',
      javaFactory: `
        try {
          KeyStore keyStore = KeyStore.getInstance("PKCS11", getProvider());
          keyStore.load(null, getPassphrase());
          return keyStore;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
