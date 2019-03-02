foam.CLASS({
  package: 'net.nanopay.security',
  name: 'AbstractKeyStoreManager',
  abstract: true,

  documentation: 'AbstractKeyStoreManager which implements a basic version of load and store key.',

  implements: [
    'net.nanopay.security.KeyStoreManager',
  ],

  javaImports: [
    'java.security.KeyStore',
    'java.util.concurrent.atomic.AtomicBoolean'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected AtomicBoolean unlocked = new AtomicBoolean(false);
        `);
      }
    }
  ],

  methods: [
    {
      name: 'loadKey',
      javaCode: `
        return this.loadKey_(alias, null);
      `
    },
    {
      name: 'loadKey_',
      javaCode: `
        return getKeyStore().getEntry(alias, protParam);
      `
    },
    {
      name: 'storeKey',
      javaCode: `
        this.storeKey_(alias, entry, null);
      `
    },
    {
      name: 'storeKey_',
      javaCode: `
        getKeyStore().setEntry(alias, entry, protParam);
      `
    },
    {
      name: 'start',
      final: true,
      javaCode: `
        this.unlock();
      `
    }
  ]
});
