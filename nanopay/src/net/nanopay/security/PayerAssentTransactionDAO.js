/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PayerAssentTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'This DAO adds the signature of the payer to the Transaction',

  javaImports: [
    'foam.dao.DAO',
    'foam.mlang.MLang',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.logger.Logger',

    'java.util.List',

    'net.nanopay.tx.model.Transaction'
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
        User user = ((Subject) x.get("subject")).getUser();
        DAO keyPairDAO = (DAO) x.get("keyPairDAO");
        DAO publicKeyDAO = (DAO) x.get("publicKeyDAO");
        DAO privateKeyDAO = (DAO) x.get("privateKeyDAO");
        Logger logger = (Logger) x.get("logger");

        Transaction tx = (Transaction) obj;
        List<Signature> signatures = tx.getSignatures();

        // check whether or not transaction is already signed by payer
        if ( signatures.stream().anyMatch(sig -> sig.getSignedBy() == user.getId()) ) {
          return super.put_(x, obj);
        }

        KeyPairEntry keyPairEntry;
        if ( ( keyPairEntry = (KeyPairEntry) keyPairDAO.inX(x).find(MLang.EQ(KeyPairEntry.OWNER, user.getId())) ) == null ) {
          logger.error("Keypair not found for user " + user.getId());
          throw new RuntimeException("KeyPair not found.");
        }

        PublicKeyEntry publicKeyEntry;
        if ( ( publicKeyEntry = (PublicKeyEntry) publicKeyDAO.inX(x).find(keyPairEntry.getPublicKeyId()) ) == null ) {
          logger.error("PublicKey not found for user " + user.getId());
          throw new RuntimeException("PublicKey not found.");
        }

        PrivateKeyEntry privateKeyEntry;
        if ( ( privateKeyEntry = (PrivateKeyEntry) privateKeyDAO.inX(x).find(keyPairEntry.getPrivateKeyId()) ) == null ) {
          logger.error("PrivateKey not found for user " + user.getId());
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
          logger.error("Unexpected exception in PayerAsssentTransactionDAO", t);
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
