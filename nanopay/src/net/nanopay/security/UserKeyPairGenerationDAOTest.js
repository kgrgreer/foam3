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
        // construct tests
        UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm(x);
        UserKeyPairGenerationDAO_KeysUseProvidedKeySize(x);
        // UserKeyPairGenerationDAO_PrivateKeyEncrypted();
        UserKeyPairGenerationDAO_PublicKeyBase64Encrypted(x);

        // put tests
        // UserKeyPairGenerationDAO_MultiplePutsGenerateOnlyOneKeyPair();
      `
    },
    {
      name: 'UserKeyPairGenerationDAO_KeysUseProvidedAlgorithm',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
  // Create the DAOs
  // All DAOs can be taken from context if UserKeyPairGenerationDAO is created there
  DAO UserKeyPairGenerationDAO = (DAO) new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x).setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo())).build();
  DAO keyPairDAO = (DAO) new net.nanopay.security.KeyPairDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.KeyPairEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"keyPairs\").build()).build();;
  DAO privateKeyDAO = (DAO) new net.nanopay.security.PrivateKeyDAO.Builder(x).setAlias(\"net.nanopay.security.PrivateKeyDAO\").setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PrivateKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"privateKeys\").build()).build();
  DAO publicKeyDAO = (DAO)  new net.nanopay.security.PublicKeyDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PublicKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"publicKeys\").build()).build();

  // Put to DAO and find keys generated
  UserKeyPairGenerationDAO.put_(x, INPUT);
  KeyPairEntry keypairDaoFind = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
  PrivateKeyEntry kprivate = (PrivateKeyEntry) privateKeyDAO.find_(x, keypairDaoFind.privateKeyId_);
  PublicKeyEntry kpublic = (PublicKeyEntry) publicKeyDAO.find_(x, keypairDaoFind.publicKeyId_);

  // Run tests
  test( (keypairDaoFind.getAlgorithm().equals(kprivate.algorithm_)) , "Private key uses algorithm set in UKPGDao" );
  test( (keypairDaoFind.getAlgorithm().equals(kpublic.algorithm_)) , "Public key uses algorithm set in UKPGDao" );

  // TODO:  Will changing the properties work? Test it...
`
    },
    {
      name: 'UserKeyPairGenerationDAO_KeysUseProvidedKeySize',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
  // Create the DAOs
  // Can be taken from context if UserKeyPairGenerationDAO is created there
  DAO keyPairDAO = (DAO) new net.nanopay.security.KeyPairDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.KeyPairEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"keyPairs\").build()).build();;
  DAO UserKeyPairGenerationDAO = (DAO) new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x).setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo())).build();
  DAO privateKeyDAO = (DAO) new net.nanopay.security.PrivateKeyDAO.Builder(x).setAlias(\"net.nanopay.security.PrivateKeyDAO\").setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PrivateKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"privateKeys\").build()).build();
  DAO publicKeyDAO = (DAO)  new net.nanopay.security.PublicKeyDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PublicKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"publicKeys\").build()).build();

  // Put to DAO and find keys generated
  UserKeyPairGenerationDAO.put_(x, INPUT);
  KeyPairEntry keypairDaoFind = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
  PrivateKeyEntry kprivate = (PrivateKeyEntry) privateKeyDAO.find_(x, keypairDaoFind.privateKeyId_);
  PublicKeyEntry kpublic = (PublicKeyEntry) publicKeyDAO.find_(x, keypairDaoFind.publicKeyId_);

  // STUCK
  // why can't I do - 
  // kpublic.getPublicKey().getModulus.bitLength;

  // Run tests
  // test( (i.getProperty("algorithm")).equals(kprivate.algorithm_) , "Private key uses algorithm set in UKPGDao" );

  // TODO:  Will changing the properties work? Test it...
`
    },
    {
      name: 'UserKeyPairGenerationDAO_PublicKeyBase64Encrypted',
      args: [
        {
          name: 'x', javaType: 'foam.core.X'
        }
      ],
      javaCode: `
  // Create the DAOs
  // Can be taken from context if UserKeyPairGenerationDAO is created there
  DAO keyPairDAO = (DAO) new net.nanopay.security.KeyPairDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.KeyPairEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"keyPairs\").build()).build();;
  DAO UserKeyPairGenerationDAO = (DAO) new net.nanopay.security.UserKeyPairGenerationDAO.Builder(x).setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo())).build();
  DAO privateKeyDAO = (DAO) new net.nanopay.security.PrivateKeyDAO.Builder(x).setAlias(\"net.nanopay.security.PrivateKeyDAO\").setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PrivateKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"privateKeys\").build()).build();
  DAO publicKeyDAO = (DAO)  new net.nanopay.security.PublicKeyDAO.Builder(x).setDelegate(new foam.dao.EasyDAO.Builder(x).setAuthenticate(false).setOf(net.nanopay.security.PublicKeyEntry.getOwnClassInfo()).setSeqNo(true).setJournaled(true).setJournalName(\"publicKeys\").build()).build();

  // Put to DAO and find keys generated
  UserKeyPairGenerationDAO.put_(x, INPUT);
  KeyPairEntry keypairDaoFind = (KeyPairEntry) keyPairDAO.inX(x).find( EQ(KeyPairEntry.OWNER, INPUT.getId()) );
  PrivateKeyEntry kprivate = (PrivateKeyEntry) privateKeyDAO.find_(x, keypairDaoFind.privateKeyId_);
  PublicKeyEntry kpublic = (PublicKeyEntry) publicKeyDAO.find_(x, keypairDaoFind.publicKeyId_);

  // Run tests
  test( Base64.isBase64(kpublic.encodedPublicKey_.getBytes()), "Public key is base64 encoded" );

`
    },
  ]
});
