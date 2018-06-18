foam.CLASS({
  package: 'net.nanopay.security',
  name: 'UserKeyPairGenerationDAO',
  extends: 'foam.dao.ProxyDAO',

  imports: [
    'keyStoreManager',
    'keyPairDAO',
    'privateKeyDAO',
    'publicKeyDAO'
  ],

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'java.security.KeyPair',
    'java.security.KeyPairGenerator'
  ],

  properties: [
    {
      class: 'Object',
      name: 'secureRandom',
      documentation: 'Secure Random used to seed key generation',
      javaType: 'java.security.SecureRandom',
      javaFactory: `
        try {
          return java.security.SecureRandom.getInstance("SHA1PRNG");
        } catch ( Throwable t ) {
          // TODO: log exception
          throw new RuntimeException(t);
        }
      `
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Key Pair algorithm'
    },
    {
      class: 'Int',
      name: 'keySize',
      documentation: 'Key Size'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        try {
          User user = (User) obj;

          // TODO: allow for usage of AlgorithmParameterSpec initializer to allow for more powerful keypair generator
          // initialize keygen
          KeyPairGenerator keygen = KeyPairGenerator.getInstance(getAlgorithm());
          keygen.initialize(getKeySize(), getSecureRandom());

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
          DAO keyPairDAO = (DAO) getKeyPairDAO();
          if ( keyPairDAO.put(keyPairEntry) == null ) {
            // TODO: log error
            throw new RuntimeException("Failed to create keypair");
          }
        } catch ( Throwable t ) {
          // TODO: log exception
          throw new RuntimeException(t);
        }

        return super.put_(x, obj);
      `
    }
  ]
});
