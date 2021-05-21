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
  name: 'UserKeyPairGenerationDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SecurityUtil',
    'java.security.KeyPair',
    'java.security.KeyPairGenerator',
    'java.security.KeyStore',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Key Pair algorithm',
      value: 'RSA'
    },
    {
      class: 'Int',
      name: 'keySize',
      documentation: 'Key Size',
      value: 4096
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User user = (User) obj;
        DAO keyPairDAO = (DAO) x.get("keyPairDAO");

        KeyStoreManager keyStoreManager = (KeyStoreManager) x.get("keyStoreManager");
        KeyStore keyStore = keyStoreManager.getKeyStore();

        // check to see if we have a keypair already
        if ( keyPairDAO.inX(x).find(EQ(KeyPairEntry.OWNER, user.getId())) == null ) {
          try {
            // TODO: allow for usage of AlgorithmParameterSpec initializer to allow for more powerful keypair generator
            // initialize keygen
            KeyPairGenerator keygen = KeyPairGenerator.getInstance(getAlgorithm());
            keygen.initialize(getKeySize(), SecurityUtil.GetSecureRandom());

            // generate keypair
            KeyPair keypair = keygen.generateKeyPair();

            // create keypair entry
            KeyPairEntry keyPairEntry = new KeyPairEntry.Builder(getX())
              .setAlgorithm(getAlgorithm())
              .setOwner(user.getId())
              .setPrivateKey(keypair.getPrivate())
              .setPublicKey(keypair.getPublic())
              .build();

            // store keypair entry
            if ( keyPairDAO.put(keyPairEntry) == null ) {
              // TODO: log error
              throw new RuntimeException("Failed to create keypair");
            }
          } catch ( Throwable t ) {
            // TODO: log
            throw new RuntimeException(t);
          }
        }

        return super.put_(x, obj);
      `
    }
  ]
});
