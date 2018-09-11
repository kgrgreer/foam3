foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PayerAssentTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'This DAO adds the signature of the payer to the Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.User',
    'net.nanopay.tx.model.Transaction',
    'java.util.List'
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA256withRSA',
      documentation: 'Signing algorithm.'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User user = (User) x.get("user");
        DAO keyPairDAO = (DAO) x.get("keyPairDAO");
        DAO privateKeyDAO = (DAO) x.get("privateKeyDAO");
        KeyStoreManager keyStoreManager = (KeyStoreManager) x.get("keyStoreManager");

        Transaction tx = (Transaction) obj;
        List<Signature> signatures = tx.getSignatures();

        // check whether or not transaction is already signed by payer
        if ( signatures.stream().anyMatch(sig -> sig.getSignedBy() == user.getId()) ) {
          return super.put_(x, obj);
        }

        KeyPairEntry keyPairEntry;
        if ( ( keyPairEntry = (KeyPairEntry) keyPairDAO.inX(x).find(MLang.EQ(KeyPairEntry.OWNER, user.getId())) ) == null ) {
          throw new RuntimeException("KeyPair not found.");
        }

        PrivateKeyEntry privateKeyEntry;
        if ( ( privateKeyEntry = (PrivateKeyEntry) privateKeyDAO.inX(x).find(keyPairEntry.getPrivateKeyId()) ) == null ) {
          throw new RuntimeException("PrivateKey not found.");
        }

        return super.put_(x, obj);
      `
    }
  ]
});
