foam.CLASS({
  package: 'net.nanopay.security',
  name: 'UserKeyPairGenerationDAOTest',
  extends: 'foam.nanos.test.Test',
  imports: [
    'keyStoreManager',
    'keyPairDAO',
    'privateKeyDAO',
    'publicKeyDAO'
  ],

  javaImports: [
    // 'nanopay.security.UserKeyPairGenerationDAO',
    'foam.core.EmptyX',
    'net.nanopay.security.KeyPairEntry',
    'net.nanopay.security.PrivateKeyEntry',
    'net.nanopay.security.PublicKeyEntry',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.core.FObject',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.mlang.sink.Count',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil',
    'static foam.mlang.MLang.EQ',
    'java.io.BufferedReader',
    'java.io.BufferedWriter',
    'java.io.File',
    'java.util.UUID',
    'java.security.KeyPair',
    'java.security.KeyPairGenerator',
    'org.apache.commons.codec.binary.Base64'

  ],

  constants: [
    {
      type: 'User',
      name: 'INPUT',
      documentation: 'Original input',
      value: `
        new User.Builder(EmptyX.instance())
          .setId(1000)
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@nanopay.net")
          .build()
      `
    }
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `

      // Create the DAOs
      // All DAOs can be taken from context if UserKeyPairGenerationDAO is created there
      DAO UserKeyPairGenerationDAO = (DAO) new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x).setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo())).build();
      DAO keyPairDAO = (DAO) new net.nanopay.security.KeyPairDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.KeyPairEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"keyPairs\").build()).build();;
      DAO privateKeyDAO = (DAO) new net.nanopay.security.PrivateKeyDAO.Builder(x).setAlias(\"net.nanopay.security.PrivateKeyDAO\").setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PrivateKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"privateKeys\").build()).build();
      DAO publicKeyDAO = (DAO)  new net.nanopay.security.PublicKeyDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PublicKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"publicKeys\").build()).build();
    
      // Put to DAO and find keys generated
      UserKeyPairGenerationDAO.put_(x, INPUT);
      KeyPairEntry generatedKeyPair = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
      PrivateKeyEntry privateKey = (PrivateKeyEntry) privateKeyDAO.find_(x, generatedKeyPair.privateKeyId_);
      PublicKeyEntry publicKey = (PublicKeyEntry) publicKeyDAO.find_(x, generatedKeyPair.publicKeyId_);
    
      
      // call tests
      UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm(x, generatedKeyPair, privateKey, publicKey);
      //UserKeyPairGenerationDAO_KeysUseProvidedKeySize(x, generatedKeyPair, privateKey, publicKey);
      // UserKeyPairGenerationDAO_PrivateKeyEncrypted(x, generatedKeyPair, privateKey, publicKey);
      UserKeyPairGenerationDAO_PublicKeyBase64Encrypted(x, privateKey, publicKey);

      // put tests
      // UserKeyPairGenerationDAO_MultiplePutsGenerateOnlyOneKeyPair(x, generatedKeyPair, privateKey, publicKey);
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
  // TODO:  Will changing the properties work? Test it...
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
  // STUCK
  // why can't I do - 
  // publicKey.getPublicKey().getModulus.bitLength;
  // test( (i.getProperty("algorithm")).equals(privateKey.algorithm_) , "Private key uses algorithm set in UKPGDao" );
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
  ]
});
