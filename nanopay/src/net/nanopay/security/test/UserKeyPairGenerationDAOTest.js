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
  package: 'net.nanopay.security.test',
  name: 'UserKeyPairGenerationDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.security.KeyPairEntry',
    'net.nanopay.security.KeyStoreManager',
    'net.nanopay.security.PrivateKeyEntry',
    'net.nanopay.security.PublicKeyEntry',
    'org.apache.commons.codec.binary.Base64',
    'javax.crypto.Cipher',
    'javax.crypto.SecretKey',
    'java.security.KeyStore',
    'java.security.PrivateKey',
    'java.security.interfaces.RSAKey',

    'static foam.mlang.MLang.EQ'
  ],

  constants: [
    {
      type: 'foam.nanos.auth.User',
      name: 'INPUT',
      documentation: 'Original input',
      javaValue: `
        new User.Builder(EmptyX.instance())
          .setId(1100)
          .setFirstName("Rumple")
          .setLastName("Stiltskin")
          .setEmail("rumple@stiltskin.au")
          .build()
      `
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        x = SecurityTestUtil.CreateSecurityTestContext(x);

        // Create the DAOs
        DAO keyPairDAO = (DAO) x.get("keyPairDAO");
        DAO privateKeyDAO = (DAO) x.get("privateKeyDAO");
        DAO publicKeyDAO = (DAO) x.get("publicKeyDAO");
        DAO UserKeyPairGenerationDAO = new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x)
          .setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo()))
          .build();

        // Put to DAO and find keys generated
        UserKeyPairGenerationDAO.put_(x, INPUT);
        KeyPairEntry generatedKeyPair = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
        PrivateKeyEntry privateKey = (PrivateKeyEntry) privateKeyDAO.find_(x, generatedKeyPair.getPrivateKeyId());
        PublicKeyEntry publicKey = (PublicKeyEntry) publicKeyDAO.find_(x, generatedKeyPair.getPublicKeyId());

        // run tests
        UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm(x, generatedKeyPair, privateKey, publicKey);
        UserKeyPairGenerationDAO_KeysUseProvidedKeySize(x, UserKeyPairGenerationDAO, publicKey);
        UserKeyPairGenerationDAO_KeysBase64Encoded(x, privateKey, publicKey);
        UserKeyPairGenerationDAO_PrivateKeyIsEncrypted(x, privateKey, (KeyStoreManager) x.get("keyStoreManager"));
        UserKeyPairGenerationDAO_MultiplePutsGenerateOnlyOneKeyPair(x, UserKeyPairGenerationDAO, keyPairDAO );
        UserKeyPairGenerationDAO_FailOnIncompatibleAlgorithmKeySizeCombination(x, UserKeyPairGenerationDAO, keyPairDAO);
      `
    },
    {
      name: 'UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'generatedKeyPair', type: 'net.nanopay.security.KeyPairEntry'
        },
        {
          name: 'privateKey', type: 'net.nanopay.security.PrivateKeyEntry'
        },
        {
          name: 'publicKey', type: 'net.nanopay.security.PublicKeyEntry'
        }
      ],
      javaCode: `
        test( (generatedKeyPair.getAlgorithm().equals(privateKey.getAlgorithm())) , "Private key uses algorithm set in DAO" );
        test( (generatedKeyPair.getAlgorithm().equals(publicKey.getAlgorithm())) , "Public key uses algorithm set in DAO" );
      `
    },
    {
      name: 'UserKeyPairGenerationDAO_KeysUseProvidedKeySize',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'UserKeyPairGenerationDAO', type: 'foam.dao.DAO'
        },
        {
          name: 'publicKey', type: 'net.nanopay.security.PublicKeyEntry'
        }
      ],
      javaCode: `
        RSAKey rsaKey = (RSAKey) publicKey.getPublicKey();
        FObject UserKeyPairGenerationObject = (FObject) UserKeyPairGenerationDAO;
        test( (  rsaKey.getModulus().bitLength() == (Integer) (UserKeyPairGenerationObject.getProperty("keySize")) ) , "Public key uses keySize set in DAO" );
      `
    },
    {
      name: 'UserKeyPairGenerationDAO_KeysBase64Encoded',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'privateKey', type: 'net.nanopay.security.PrivateKeyEntry'
        },
        {
          name: 'publicKey', type: 'net.nanopay.security.PublicKeyEntry'
        }
      ],
      javaCode: `
        test( Base64.isBase64(publicKey.getEncodedPublicKey().getBytes()), "Public key is base64 encoded" );
        test( Base64.isBase64(privateKey.getEncryptedPrivateKey().getBytes()), "Encrypted private key is base64 encoded" );
      `
    },
    {
      name: 'UserKeyPairGenerationDAO_PrivateKeyIsEncrypted',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'privateKey', type: 'net.nanopay.security.PrivateKeyEntry'
        },
        {
          name: 'keyStoreManager', type: 'net.nanopay.security.KeyStoreManager'
        }
      ],
      javaCode: `
        try {
          System.out.println("keyStoreManager.size(): " + keyStoreManager.getKeyStore().size());
          KeyStore.SecretKeyEntry entry = (KeyStore.SecretKeyEntry) keyStoreManager.loadKey("net.nanopay.security.PrivateKeyDAO");
          SecretKey secretKey = entry.getSecretKey();
          Cipher cipher = Cipher.getInstance(secretKey.getAlgorithm());
          cipher.init(Cipher.UNWRAP_MODE, secretKey);
          byte[] encryptedBytes = org.bouncycastle.util.encoders.Base64.decode(privateKey.getEncryptedPrivateKey());
          PrivateKey decryptedPrivateKey = (PrivateKey) cipher.unwrap(encryptedBytes, privateKey.getAlgorithm(), Cipher.PRIVATE_KEY);
          test(true , "Private key is encrypted");
        } catch (Throwable t){
          test(false , "Private key is not encrypted");
        }
      `
    },
    {
      name: 'UserKeyPairGenerationDAO_MultiplePutsGenerateOnlyOneKeyPair',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'UserKeyPairGenerationDAO', type: 'foam.dao.DAO'
        },
        {
          name: 'keyPairDAO', type: 'foam.dao.DAO'
        }
      ],
      javaCode: `
        KeyPairEntry firstGeneratedKeyPair = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
        UserKeyPairGenerationDAO.put_(x, INPUT);
        UserKeyPairGenerationDAO.put_(x, INPUT);
        KeyPairEntry multiplePutKeyPair = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
        test( multiplePutKeyPair.equals(firstGeneratedKeyPair), "Multiple puts to DAO generate no more than one keypair" );
      `
    },
    {
      name: 'UserKeyPairGenerationDAO_FailOnIncompatibleAlgorithmKeySizeCombination',
      args: [
        {
          name: 'x', type: 'Context'
        },
        {
          name: 'UserKeyPairGenerationDAO', type: 'foam.dao.DAO'
        },
        {
          name: 'keyPairDAO', type: 'foam.dao.DAO'
        }
      ],
      javaCode: `
        User newUser = new User.Builder(x).setId(100).setFirstName("Roald").setLastName("Dahl").setEmail("roal@dahl.lit").build();

        // set incomaptible algorithm and keySize on the UserKeyPairGenerationDAO
        net.nanopay.security.UserKeyPairGenerationDAO castedUserKeyPairGenerationDAO = (net.nanopay.security.UserKeyPairGenerationDAO) UserKeyPairGenerationDAO;
        castedUserKeyPairGenerationDAO.setAlgorithm("DSA");
        castedUserKeyPairGenerationDAO.setKeySize(222);
        DAO reCastedDAO = (DAO) castedUserKeyPairGenerationDAO;

        boolean threw = false;
        try {
          reCastedDAO.put_(x, newUser);
        } catch (Exception e) {
          threw = true;
        }
        test( threw, "Putting incompatible KeySize and Algorithm throws an exception" );
      `
    }
  ]
});
