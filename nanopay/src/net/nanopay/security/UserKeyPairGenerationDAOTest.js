foam.CLASS({
  package: 'net.nanopay.security',
  name: 'UserKeyPairGenerationDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.EQ',
    'java.security.interfaces.RSAKey',
    'org.apache.commons.codec.binary.Base64'
  ],

  constants: [
    {
      type: 'User',
      name: 'INPUT',
      documentation: 'Original input',
      value: `
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
  // Create the DAOs
  DAO UserKeyPairGenerationDAO = (DAO) new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x).setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo())).build();
  DAO keyPairDAO = (DAO) new net.nanopay.security.KeyPairDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.KeyPairEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"keyPairs\").build()).build();;
  DAO privateKeyDAO = (DAO) new net.nanopay.security.PrivateKeyDAO.Builder(x).setAlias(\"net.nanopay.security.PrivateKeyDAO\").setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PrivateKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"privateKeys\").build()).build();
  DAO publicKeyDAO = (DAO)  new net.nanopay.security.PublicKeyDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PublicKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"publicKeys\").build()).build();

  // Put to DAO and find keys generated
  UserKeyPairGenerationDAO.put_(x, INPUT);
  KeyPairEntry generatedKeyPair = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
  PrivateKeyEntry privateKey = (PrivateKeyEntry) privateKeyDAO.find_(x, generatedKeyPair.privateKeyId_);
  PublicKeyEntry publicKey = (PublicKeyEntry) publicKeyDAO.find_(x, generatedKeyPair.publicKeyId_);

  
  // // run tests
  // UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm(x, generatedKeyPair, privateKey, publicKey);
  // UserKeyPairGenerationDAO_KeysUseProvidedKeySize(x, UserKeyPairGenerationDAO, publicKey);
  // // UserKeyPairGenerationDAO_PrivateKeyEncrypted(x, generatedKeyPair, privateKey, publicKey);
  // UserKeyPairGenerationDAO_PublicKeyBase64Encrypted(x, privateKey, publicKey);
  // UserKeyPairGenerationDAO_MultiplePutsGenerateOnlyOneKeyPair(x, UserKeyPairGenerationDAO, keyPairDAO );
  UserKeyPairGenerationDAO_FailOnIncompatibleAlgorithmKeySizeCombination(x, UserKeyPairGenerationDAO, keyPairDAO);
  
  `
    },
    {
      name: 'UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'generatedKeyPair', javaType: 'net.nanopay.security.KeyPairEntry'
        },
        {
          name: 'privateKey', javaType: 'net.nanopay.security.PrivateKeyEntry'
        },
        {
          name: 'publicKey', javaType: 'net.nanopay.security.PublicKeyEntry'
        }
      ],
      javaCode: `
  test( (generatedKeyPair.getAlgorithm().equals(privateKey.algorithm_)) , "Private key uses algorithm set in DAO" );
  test( (generatedKeyPair.getAlgorithm().equals(publicKey.algorithm_)) , "Public key uses algorithm set in DAO" );
  `
    },
    {
      name: 'UserKeyPairGenerationDAO_KeysUseProvidedKeySize',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'UserKeyPairGenerationDAO', javaType: 'foam.dao.DAO'
        },
        {
          name: 'publicKey', javaType: 'net.nanopay.security.PublicKeyEntry'
        }
      ],
      javaCode: `
  RSAKey rsaKey = (RSAKey) publicKey.getPublicKey();
  FObject UserKeyPairGenerationObject = (FObject) UserKeyPairGenerationDAO;
  test( (  rsaKey.getModulus().bitLength() == (Integer) (UserKeyPairGenerationObject.getProperty("keySize")) ) , "Public key uses keySize set in DAO" );
  `
    },
    {
      name: 'UserKeyPairGenerationDAO_PublicKeyBase64Encrypted',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'privateKey', javaType: 'net.nanopay.security.PrivateKeyEntry'
        },
        {
          name: 'publicKey', javaType: 'net.nanopay.security.PublicKeyEntry'
        }
      ],
      javaCode: `
  test( Base64.isBase64(publicKey.encodedPublicKey_.getBytes()), "Public key is base64 encoded" );
  test( Base64.isBase64(privateKey.encryptedPrivateKey_.getBytes()), "Encrypted private key is base64 encoded" );
  `
    },

    {
      name: 'UserKeyPairGenerationDAO_MultiplePutsGenerateOnlyOneKeyPair',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'UserKeyPairGenerationDAO', javaType: 'foam.dao.DAO'
        },
        {
          name: 'keyPairDAO', javaType: 'foam.dao.DAO'
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
          name: 'x', javaType: 'foam.core.X'
        },
        {
          name: 'UserKeyPairGenerationDAO', javaType: 'foam.dao.DAO'
        },
        {
          name: 'keyPairDAO', javaType: 'foam.dao.DAO'
        }
      ],
      javaCode: `
  
  net.nanopay.security.UserKeyPairGenerationDAO UserKeyPairGenerationDAOx = (net.nanopay.security.UserKeyPairGenerationDAO) UserKeyPairGenerationDAO;
  UserKeyPairGenerationDAOx.setAlgorithm("RSA");
  UserKeyPairGenerationDAOx.setKeySize(1);
  System.err.print(UserKeyPairGenerationDAOx.getAlgorithm());
  System.err.print(UserKeyPairGenerationDAOx.getKeySize());
  DAO xid = (DAO) UserKeyPairGenerationDAOx;
  System.err.print(xid);
  xid.put_(x, INPUT);
  KeyPairEntry generatedKeyPair = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
  System.err.print(generatedKeyPair);
      `
    }
  ]
});
