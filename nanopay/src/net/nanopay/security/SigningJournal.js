foam.CLASS({
  package: 'net.nanopay.security',
  name: 'SigningJournal',
  extends: 'foam.dao.FileJournal',

  imports: [
    'keyPairDAO',
    'publicKeyDAO',
    'privateKeyDAO'
  ],

  javaImports: [
    'foam.core.FObject',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'org.bouncycastle.util.encoders.Base64',
    'java.security.AccessControlException',
    'static foam.mlang.MLang.EQ'
  ],

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Signing algorithm',
      value: 'SHA256withRSA'
    }
  ],

  methods: [
    {
      name: 'put',
      javaCode: `
        FObject fobj = (FObject) obj;
        User user = (User) getX().get("user");
        DAO keyPairDAO = (DAO) getKeyPairDAO();
        DAO privateKeyDAO = (DAO) getPrivateKeyDAO();

        if ( user == null ) {
          throw new AccessControlException("User is not logged in");
        }

        KeyPairEntry keyPairEntry = (KeyPairEntry) keyPairDAO.inX(getX()).find(EQ(KeyPairEntry.OWNER, user.getId()));
        PrivateKeyEntry entry = (PrivateKeyEntry) privateKeyDAO.find(keyPairEntry.getPrivateKeyId());
        String signature = Base64.toBase64String(fobj.sign(getAlgorithm(), entry.getPrivateKey()));

        super.put(new SignedFObject.Builder(getX())
          .setId(fobj.getProperty("id"))
          .setAlgorithm(getAlgorithm())
          .setSignature(signature)
          .setValue(fobj)
          .build(), sub);
      `
    }
  ]
});
