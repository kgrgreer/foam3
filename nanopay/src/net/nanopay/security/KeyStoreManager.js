foam.INTERFACE({
  package: 'net.nanopay.security',
  name: 'KeyStoreManager',

  methods: [
    {
      name: 'getKeyStore',
      javaReturns: 'java.security.KeyStore',
      documentation: 'Fetches a keystore'
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