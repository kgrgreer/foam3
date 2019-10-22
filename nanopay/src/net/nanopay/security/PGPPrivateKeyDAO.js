foam.CLASS({
  package: 'net.nanopay.security',
  name: 'PGPPrivateKeyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Stores the encrypted version of the private key',

  javaImports: [
    'foam.util.SecurityUtil',
    'org.bouncycastle.util.encoders.Base64',
    'javax.crypto.Cipher',
    'javax.crypto.KeyGenerator',
    'javax.crypto.SecretKey',
    'java.security.KeyStore',
    'java.security.PrivateKey',
    'java.io.IOException',
    'java.io.ByteArrayInputStream',
    'java.io.InputStream',

    'org.bouncycastle.openpgp.PGPPrivateKey',
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
          if ( ! keyStore.containsAlias(entry.getAlias()) ) {
            throw new RuntimeException("Private key not found");
          }

          // load secret key from keystore
          KeyStore.SecretKeyEntry keyStoreEntry = (KeyStore.SecretKeyEntry) manager.loadKey(entry.getAlias());
          SecretKey key = keyStoreEntry.getSecretKey();
          Cipher cipher = Cipher.getInstance(key.getAlgorithm());
          cipher.init(Cipher.DECRYPT_MODE, key);

          // unwrap private key
          byte[] encryptedBytes = Base64.decode(entry.getEncryptedPrivateKey());
          byte[] decodedBytes = cipher.doFinal(encryptedBytes);
          InputStream privateKeyIs = new ByteArrayInputStream(decodedBytes);
          PgpPrivateKeyWrapper privateKey = new PgpPrivateKeyWrapper(PgpPrivateKeyWrapper.findSecretKey(privateKeyIs, "nanopay".toCharArray()));
          entry.setPrivateKey(privateKey);
          
          return entry;
        } catch ( Throwable t ) {
           t.printStackTrace();
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
          if ( ! keyStore.containsAlias(entry.getAlias()) ) {
            throw new RuntimeException("Private key not found");
          }

          // load secret key from keystore
          KeyStore.SecretKeyEntry keyStoreEntry = (KeyStore.SecretKeyEntry) manager.loadKey(entry.getAlias());
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
    }
  ]
});
