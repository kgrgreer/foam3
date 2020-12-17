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
  name: 'PrivateKeyDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: 'Stores the encrypted version of the private key',

  javaImports: [
    'foam.util.SecurityUtil',
    'org.bouncycastle.util.encoders.Base64',
    'javax.crypto.Cipher',
    'javax.crypto.KeyGenerator',
    'javax.crypto.SecretKey',
    'java.security.KeyStore',
    'java.security.PrivateKey'
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Key algorithm for key used to encrypt private key',
      value: 'AES'
    },
    {
      class: 'Int',
      name: 'keySize',
      documentation: 'Key size for key used to encrypt private key',
      value: 256
    },
    {
      class: 'String',
      name: 'alias',
      documentation: 'Alias for key used to encrypt private key'
    },
    {
      class: 'Object',
      name: 'secretKey',
      documentation: 'Secret key used to wrap the private key',
      javaType: 'javax.crypto.SecretKey',
      javaFactory: `
        try {
          KeyStoreManager manager = (KeyStoreManager) getX().get("keyStoreManager");
          KeyStore keyStore = manager.getKeyStore();

          // check if key store contains alias
          if ( keyStore.containsAlias(getAlias()) ) {
            // return secret key from key store
            KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) manager.loadKey(getAlias());
            return entry.getSecretKey();
          }

          // initialize keygen
          KeyGenerator keygen = KeyGenerator.getInstance(getAlgorithm());
          keygen.init(getKeySize(), SecurityUtil.GetSecureRandom());

          // generate secret key and store
          SecretKey key = keygen.generateKey();
          manager.storeKey(getAlias(), new KeyStore.SecretKeyEntry(key));
          return key;
        } catch ( Throwable t ) {
          // TODO: log exception
          throw new RuntimeException(t);
        }
      `
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        foam.core.FObject obj = super.find_(x, id);
        PrivateKeyEntry entry = (PrivateKeyEntry) obj;
        if ( entry == null ) {
          throw new RuntimeException("Private key not found");
        }

        // A decorator lower down in the chain might have already decoded the private key
        if ( entry.getPrivateKey() != null ) return entry;

        entry = (PrivateKeyEntry) entry.fclone();
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
          cipher.init(Cipher.UNWRAP_MODE, key);

          // unwrap private key
          byte[] encryptedBytes = Base64.decode(entry.getEncryptedPrivateKey());
          PrivateKey privateKey = (PrivateKey) cipher.unwrap(encryptedBytes, entry.getAlgorithm(), Cipher.PRIVATE_KEY);
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
        if ( privateKey == null ) {
          throw new RuntimeException("Private key not found");
        }
        
        // PGPPrivate keys need to be encrypted and not wrapped, this is handled by PGPPrivateKeyDAo dow the line
        if ( privateKey instanceof PgpPrivateKeyWrapper ) return getDelegate().put_(x, entry);

        try {
          // initialize cipher for key wrapping
          SecretKey key = getSecretKey();
          Cipher cipher = Cipher.getInstance(key.getAlgorithm());
          cipher.init(Cipher.WRAP_MODE, key, SecurityUtil.GetSecureRandom());
          entry.setEncryptedPrivateKey(Base64.toBase64String(cipher.wrap(privateKey)));
          entry.setAlias(getAlias());
          entry.setPrivateKey(null);
          return super.put_(x, entry);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ]
});
