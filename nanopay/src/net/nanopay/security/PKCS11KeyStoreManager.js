foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PKCS11KeyStoreManager',
  extends: 'net.nanopay.security.AbstractKeyStoreManager',

  documentation: 'KeyStore that uses PKCS #11 as the API',

  javaImports: [
    'sun.security.pkcs11.SunPKCS11',

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
    },
    {
      class: 'Object',
      name: 'passphrase',
      transient: true,
      javaType: 'char[]',
      javaFactory: `
        return new char[] {0};
      `
    }
  ],

  methods: [
    {
      name: 'storeKey',
      javaCode: `
        throw new UnsupportedOperationException("Unsupported operation: storeKey");
      `
    }
  ]
});
