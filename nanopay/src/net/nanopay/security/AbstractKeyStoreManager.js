foam.CLASS({
  package: 'net.nanopay.security',
  name: 'AbstractKeyStoreManager',
  abstract: true,

  documentation: 'AbstractKeyStoreManager which only implements loadKey.',

  implements: [
    'net.nanopay.security.KeyStoreManager',
  ],

  javaImports: [
    'java.security.KeyStore'
  ],

  methods: [
    {
      name: 'loadKey',
      javaCode: `
        try {
          return getKeyStore().getEntry(alias, new KeyStore.PasswordProtection(getPassphrase()));
        } catch (Throwable t) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
