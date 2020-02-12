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
      transient: true,
      javaType: 'java.security.Provider',
      javaFactory: `
        return new SunPKCS11(getConfig());
      `
    },
    {
      class: 'Object',
      name: 'loadStoreParameter',
      documentation: 'KeyStore loading parameters used for unlocking.',
      transient: true,
      required: true,
      javaType: 'java.security.KeyStore.LoadStoreParameter',
    },
    {
      class: 'Object',
      name: 'keyStore',
      documentation: 'KeyStore object.',
      transient: true,
      javaType: 'java.security.KeyStore',
      javaFactory: `
        try {
          return KeyStore.getInstance("PKCS11", getProvider());
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ],

  methods: [
    {
      name: 'unlock',
      javaCode: `
        if ( ! unlocked.get() ) {
          // unlock using load store parameter
          getKeyStore().load(getLoadStoreParameter());
          // set unlocked to true
          unlocked.set(true);
        }
      `
    }
  ]
});
