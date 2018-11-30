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
        DAO publicKeyDAO = (DAO) x.get("publicKeyDAO");
        DAO privateKeyDAO = (DAO) x.get("privateKeyDAO");

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

        PublicKeyEntry publicKeyEntry;
        if ( ( publicKeyEntry = (PublicKeyEntry) publicKeyDAO.inX(x).find(keyPairEntry.getPublicKeyId()) ) == null ) {
          throw new RuntimeException("PublicKey not found.");
        }

        PrivateKeyEntry privateKeyEntry;
        if ( ( privateKeyEntry = (PrivateKeyEntry) privateKeyDAO.inX(x).find(keyPairEntry.getPrivateKeyId()) ) == null ) {
          throw new RuntimeException("PrivateKey not found.");
        }

        try {
          // put to delegate before signing
          tx = (Transaction) super.put_(x, tx);

          // generate signature
          java.security.Signature signer = java.security.Signature.getInstance(getAlgorithm());
          signer.initSign(privateKeyEntry.getPrivateKey(), foam.util.SecurityUtil.GetSecureRandom());
          byte[] signature = tx.sign(signer);

          // add signature to transaction
          String fingerprint = foam.util.SecurityUtil.GenerateSSHKeyFingerprintFromPublicKey(publicKeyEntry.getPublicKey());
          tx.getSignatures().add(new Signature.Builder(x)
            .setAlgorithm(getAlgorithm())
            .setPublicKey(fingerprint)
            .setSignedBy(user.getId())
            .setSignature(signature)
            .build());

          return super.put_(x, tx);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
