foam.INTERFACE({
  package: 'net.nanopay.security',
  name: 'KeyStoreManager',

  methods: [
    {
      name: 'getKeyStore',
      javaReturns: 'java.security.KeyStore',
      documentation: 'Returns the KeyStore.'
    },
    {
      name: 'getPassphrase',
      javaReturns: 'char[]',
      documentation: 'Returns the KeyStore\'s passphrase.'
    },
    {
      name: 'loadKey',
      javaReturns: 'java.security.KeyStore.Entry',
      documentation: 'Loads a key from the KeyStore.',
      args: [
        {
          name: 'alias',
          javaType: 'String'
        }
      ]
    },
    {
      name: 'storeKey',
      javaReturns: 'void',
      documentation: 'Stores a new key',
      args: [
        {
          name: 'alias',
          javaType: 'String'
        },
        {
          name: 'entry',
          javaType: 'java.security.KeyStore.Entry'
        }
      ]
    }
  ]
});
