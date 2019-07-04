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
