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
  name: 'KeyPairDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Stores a key pair entry into the DAO, putting the public key and private key into separate DAO\'s',

  javaImports: [
    'foam.dao.DAO',
    'org.bouncycastle.util.encoders.Base64',
    'java.security.PrivateKey',
    'java.security.PublicKey'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        // get public and private keys
        KeyPairEntry entry = (KeyPairEntry) obj;
        PrivateKey privateKey = entry.getPrivateKey();
        PublicKey publicKey = entry.getPublicKey();

        // check if private key is null
        if ( privateKey == null ) {
          throw new RuntimeException("Private key not found");
        }

        // check if public key is null
        if ( publicKey == null ) {
          throw new RuntimeException("Public key not found");
        }

        // create private key entry
        DAO privateKeyDAO = (DAO) x.get("privateKeyDAO");
        PrivateKeyEntry privateKeyEntry = new PrivateKeyEntry.Builder(getX())
          .setAlgorithm(privateKey.getAlgorithm())
          .setAlias(entry.getAlias())
          .setPrivateKey(privateKey)
          .build();

        // store private key
        PrivateKeyEntry privateKeyResult = (PrivateKeyEntry) privateKeyDAO.put(privateKeyEntry);
        if ( privateKeyResult == null ) {
          throw new RuntimeException("Error storing private key");
        }

        // update entry with private key id and set private key to null
        entry.setPrivateKeyId(privateKeyResult.getId());
        entry.setPrivateKey(null);

        // create public key entry
        DAO publicKeyDAO = (DAO) x.get("publicKeyDAO");
        PublicKeyEntry publicKeyEntry = new PublicKeyEntry.Builder(getX())
          .setAlgorithm(publicKey.getAlgorithm())
          .setAlias(entry.getAlias())
          .setPublicKey(publicKey)
          .build();

        // store public key
        PublicKeyEntry publicKeyResult = (PublicKeyEntry) publicKeyDAO.put(publicKeyEntry);
        if ( publicKeyResult == null ) {
          throw new RuntimeException("Error storing public key");
        }

        // update entry with public key id and set public key to null
        entry.setPublicKeyId(publicKeyResult.getId());
        entry.setPublicKey(null);

        // store update key pair entry in delegate
        return super.put_(x, entry);
      `
    }
  ]
});
