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
  name: 'PGPPrivateKeyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Stores the encrypted version of the private key',

  javaImports: [
    'foam.dao.DAO',
    'foam.util.SecurityUtil',

    'java.io.ByteArrayInputStream',
    'java.io.InputStream',
    'java.io.IOException',
    'java.security.KeyStore',
    'java.security.PrivateKey',
    'java.security.Security',
    'javax.crypto.Cipher',
    'javax.crypto.KeyGenerator',
    'javax.crypto.SecretKey',

    'org.bouncycastle.bcpg.BCPGInputStream',
    'org.bouncycastle.bcpg.BCPGKey',
    'org.bouncycastle.bcpg.RSASecretBCPGKey',
    'org.bouncycastle.openpgp.PGPPrivateKey',
    'org.bouncycastle.util.encoders.Base64',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        foam.core.FObject obj = super.find_(x, id);
        PrivateKeyEntry entry = (PrivateKeyEntry) obj;
        if ( entry == null ) return entry;

        if ( ! "OpenPGP".equals(entry.getAlgorithm()) ) return entry;

        try {
          // initialize cipher for key unwrapping
          KeyStoreManager manager = (KeyStoreManager) x.get("keyStoreManager");
          KeyStore keyStore = manager.getKeyStore();

          // check if key store contains alias
          PrivateKeyDAO privateKeyDAO = this.getPrivateKeyDAO(x);
          if ( ! keyStore.containsAlias(privateKeyDAO.getAlias()) ) {
            throw new RuntimeException("Private key not found");
          }

          // load secret key from keystore
          Security.addProvider(keyStore.getProvider());
          KeyStore.SecretKeyEntry keyStoreEntry = (KeyStore.SecretKeyEntry) manager.loadKey(privateKeyDAO.getAlias());
          SecretKey key = keyStoreEntry.getSecretKey();
          Cipher cipher = Cipher.getInstance(key.getAlgorithm());
          cipher.init(Cipher.DECRYPT_MODE, key);

          // decrypt private key
          byte[] encryptedBytes = Base64.decode(entry.getEncryptedPrivateKey());
          byte[] decodedBytes = cipher.doFinal(encryptedBytes);

          // Fetch public key
          DAO keyPairDAO = (DAO) x.get("keyPairDAO");
          KeyPairEntry keyPair = (KeyPairEntry) ((DAO) x.get("keyPairDAO")).find(foam.mlang.MLang.EQ(KeyPairEntry.ALIAS, entry.getAlias()));
          if ( keyPair == null ) return null;
          PublicKeyEntry pubKeyEntry = (PublicKeyEntry) ((DAO) x.get("publicKeyDAO")).find(keyPair.getPublicKeyId());
          if ( pubKeyEntry == null || ! (pubKeyEntry.getPublicKey() instanceof PgpPublicKeyWrapper) ) return null;
          PgpPublicKeyWrapper publicKey = (PgpPublicKeyWrapper) pubKeyEntry.getPublicKey();

          InputStream privateKeyIs = new ByteArrayInputStream(decodedBytes);
          BCPGInputStream bcpgStream = new BCPGInputStream(privateKeyIs);
          BCPGKey bcpgImp = new RSASecretBCPGKey(bcpgStream);
          PGPPrivateKey pgpPrivateKey = new PGPPrivateKey(publicKey.getPGPPublicKey().getKeyID(), publicKey.getPGPPublicKey().getPublicKeyPacket(), bcpgImp);

          PgpPrivateKeyWrapper privateKey = new PgpPrivateKeyWrapper(pgpPrivateKey);
          entry = (PrivateKeyEntry) entry.fclone();
          entry.setPrivateKey(privateKey);

          return entry;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'put_',
      javaCode: `
        PrivateKeyEntry entry = (PrivateKeyEntry) obj;
        PrivateKey privateKey = entry.getPrivateKey();

        if ( ! (privateKey instanceof PgpPrivateKeyWrapper) ) return getDelegate().put_(x, entry);

        try {
          // initialize cipher for key unwrapping
          KeyStoreManager manager = (KeyStoreManager) x.get("keyStoreManager");
          KeyStore keyStore = manager.getKeyStore();

          // check if key store contains alias
          PrivateKeyDAO privateKeyDAO = this.getPrivateKeyDAO(x);
          if ( ! keyStore.containsAlias(privateKeyDAO.getAlias()) ) {
            throw new RuntimeException("Private key not found");
          }

          // load secret key from keystore
          Security.addProvider(keyStore.getProvider());
          KeyStore.SecretKeyEntry keyStoreEntry = (KeyStore.SecretKeyEntry) manager.loadKey(privateKeyDAO.getAlias());
          SecretKey key = keyStoreEntry.getSecretKey();
          Cipher cipher = Cipher.getInstance(key.getAlgorithm());
          cipher.init(Cipher.ENCRYPT_MODE, key, SecurityUtil.GetSecureRandom());
          entry.setEncryptedPrivateKey(Base64.toBase64String(cipher.doFinal(privateKey.getEncoded())));
          entry.setAlgorithm(privateKey.getAlgorithm());
          entry.setPrivateKey(null);
          return super.put_(x, entry);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'getPrivateKeyDAO',
      args: [
        { name: 'x', type: 'Context' }
      ],
      javaType: 'net.nanopay.security.PrivateKeyDAO',
      javaCode: `
        DAO privateKeyDAO = ((foam.dao.ProxyDAO) x.get("privateKeyDAO")).getDelegate();
        while ( privateKeyDAO != null ) {
          if ( privateKeyDAO instanceof PrivateKeyDAO ) break;
          if (privateKeyDAO instanceof foam.dao.ProxyDAO ) {
            privateKeyDAO = ((foam.dao.ProxyDAO)privateKeyDAO).getDelegate();
          } else { privateKeyDAO = null; }
        }

        if ( privateKeyDAO == null ) throw new RuntimeException("PrivateKeyDAO is unavailable.");

        return (PrivateKeyDAO) privateKeyDAO;
      `
    }
  ]
});
