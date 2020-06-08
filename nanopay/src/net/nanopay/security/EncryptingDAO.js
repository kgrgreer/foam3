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
  name: 'EncryptingDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.lib.json.Outputter',
    'foam.nanos.logger.Logger'
  ],

  imports: [
    'Logger logger'
  ],

  constants: [
    {
      name: 'AES_KEY_SIZE',
      type: 'Integer',
      value: 256
    },
    {
      name: 'GCM_NONCE_LENGTH',
      type: 'Integer',
      value: 12
    },
    {
      name: 'GCM_TAG_LENGTH',
      type: 'Integer',
      value: 16
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'alias'
    },
    {
      class: 'Object',
      name: 'secretKey',
      javaType: 'javax.crypto.SecretKey',
      javaFactory: `
        try {
          KeyStoreManager manager = (KeyStoreManager) getX().get("keyStoreManager");
          java.security.KeyStore keyStore = manager.getKeyStore();

          // check if keystore contains alias. load if it does, create if it doesn't
          if (keyStore.containsAlias(getAlias())) {
            java.security.KeyStore.SecretKeyEntry entry =
              (java.security.KeyStore.SecretKeyEntry) manager.loadKey(getAlias());
            return entry.getSecretKey();
          }

          // generate AES key using BC as provider
          javax.crypto.KeyGenerator keygen = javax.crypto.KeyGenerator.getInstance("AES");
          keygen.init(AES_KEY_SIZE, foam.util.SecurityUtil.GetSecureRandom());
          javax.crypto.SecretKey key = keygen.generateKey();

          // set secret key entry in keystore
          java.security.KeyStore.SecretKeyEntry entry =
            new java.security.KeyStore.SecretKeyEntry(key);
          manager.storeKey(getAlias(), entry);

          return key;
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        try {
          javax.crypto.Cipher cipher = javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");
          final byte[] nonce = new byte[GCM_NONCE_LENGTH];
          foam.util.SecurityUtil.GetSecureRandom().nextBytes(nonce);
          javax.crypto.spec.GCMParameterSpec spec =
            new javax.crypto.spec.GCMParameterSpec(GCM_TAG_LENGTH * 8, nonce);
          cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, getSecretKey(), spec);

          Outputter outputter = new Outputter(x);
          byte[] input = outputter.stringify(obj).getBytes(java.nio.charset.StandardCharsets.UTF_8);
          byte[] cipherText = new byte[cipher.getOutputSize(input.length)];
          int updated = cipher.update(input, 0, input.length, cipherText, 0);
          cipher.doFinal(cipherText, updated);

          // prefix cipher text with nonce for decrypting later
          byte[] nonceWithCipherText = new byte[nonce.length + cipherText.length];
          System.arraycopy(nonce, 0, nonceWithCipherText, 0, nonce.length);
          System.arraycopy(cipherText, 0, nonceWithCipherText, nonce.length, cipherText.length);

          // store encrypted object instead of original object
          EncryptedObject encryptedObject = new EncryptedObject.Builder(x)
              .setId(obj.getProperty("id"))
              .setData(java.util.Base64.getEncoder().encodeToString(nonceWithCipherText))
              .build();

          return super.put_(x, encryptedObject);
        } catch (Throwable t) {
          ((foam.nanos.logger.Logger) getLogger()).error("Error encrypting object", t);
          return null;
        }
      `
    },
    {
      name: 'find_',
      javaCode: `
        try {
          EncryptedObject encryptedObject = (EncryptedObject) super.find_(x, id);
          byte[] data = java.util.Base64.getDecoder().decode(encryptedObject.getData());

          final byte[] nonce = new byte[GCM_NONCE_LENGTH];
          final byte[] cipherText = new byte[data.length - GCM_NONCE_LENGTH];

          // copy nonce and ciphertext
          System.arraycopy(data, 0, nonce, 0, nonce.length);
          System.arraycopy(data, nonce.length, cipherText, 0, cipherText.length);

          // create cipher
          javax.crypto.Cipher cipher = javax.crypto.Cipher.getInstance("AES/GCM/NoPadding");
          javax.crypto.spec.GCMParameterSpec spec =
            new javax.crypto.spec.GCMParameterSpec(GCM_TAG_LENGTH * 8, nonce);
          cipher.init(javax.crypto.Cipher.DECRYPT_MODE, getSecretKey(), spec);

          // decrypt ciphertext
          foam.lib.json.JSONParser parser = x.create(foam.lib.json.JSONParser.class);
          byte[] plaintext = new byte[cipher.getOutputSize(cipherText.length)];
          int updated = cipher.update(cipherText, 0, cipherText.length, plaintext, 0);
          cipher.doFinal(plaintext, updated);

          return parser.parseString(new String(plaintext, java.nio.charset.StandardCharsets.UTF_8));
        } catch (Throwable t) {
          ((foam.nanos.logger.Logger) getLogger()).error("Error decrypting object", t);
          return null;
        }
      `
    },
    {
      name: 'select_',
      javaCode: `
        // allow UnarySinks that query based on id
        if ( predicate == null && sink instanceof foam.mlang.sink.AbstractUnarySink ) {
          foam.mlang.Expr expr = ((foam.mlang.sink.AbstractUnarySink) sink).getArg1();
          if ( expr instanceof foam.core.PropertyInfo && "id".equals(((foam.core.PropertyInfo) expr).getName()) ) {
            return super.select_(x, sink, skip, limit, order, predicate);
          }
        }

        getDelegate().inX(x).select(new DecryptingSink(x, this, decorateSink_(sink, skip, limit, order, predicate)));
        return sink;
      `
    }
  ]
});
