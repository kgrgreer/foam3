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
    'foam.core.PropertyInfo',
    'foam.lib.json.JSONParser',
    'foam.util.SafetyUtil',
    'org.bouncycastle.util.encoders.Base64',
    'java.io.BufferedReader',
    'foam.nanos.auth.User',
    'foam.dao.DAO',
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
      name: 'replay',
      javaCode: `

  // count number of lines successfully read
  long successReading = 0;
  JSONParser parser = getX().create(JSONParser.class);

  try ( BufferedReader reader = getReader() ) {
    for ( String line ; ( line = reader.readLine() ) != null ; ) {
      if ( SafetyUtil.isEmpty(line)        ) continue;
      if ( COMMENT.matcher(line).matches() ) continue;
      try {
        char operation = line.charAt(0);
        int length = line.trim().length();
        line = line.trim().substring(2, length - 1);

        SignedFObject signedFObj = (SignedFObject) parser.parseString(line, SignedFObject.class);
        if ( signedFObj == null ) {
          getLogger().error("parse error","line:", line);
          continue;
        }

        User user = (User) signedFObj.getSignedBy();
        if ( user == null ) {
          throw new Exception("User is not logged in");
        }

        // verify signature
        byte[] signature = Base64.decode(signedFObj.getSignature());
        DAO keyPairDAO = (DAO) getKeyPairDAO();
        DAO publicKeyDAO = (DAO) getPublicKeyDAO();
        KeyPairEntry keyPairEntry = (KeyPairEntry) keyPairDAO.inX(getX()).find(EQ(KeyPairEntry.OWNER, user.getId()));
        PublicKeyEntry entry = (PublicKeyEntry) publicKeyDAO.find(keyPairEntry.getPublicKeyId());

        if ( ! signedFObj.verify(signature, signedFObj.getAlgorithm(), entry.getPublicKey())) {
          throw new Exception("Error verifying signature");
        }

        FObject object = signedFObj.getValue();
        switch ( operation ) {
          case 'p':
            PropertyInfo id = (PropertyInfo) dao.getOf().getAxiomByName("id");
            FObject old = dao.find(id.get(object));
            if ( old != null ) {
              // merge difference
              object = mergeFObject(old.fclone(), object);
            }
            dao.put(object);
            break;
          case 'r':
            dao.remove(object);
            break;
        }
        successReading++;

      } catch ( Throwable t ) {
        getLogger().error("encoutered an error while replaying journal: ", line, t);
      }
    }
  } catch ( Throwable t) {
    getLogger().error("failed to read from journal", t);
  } finally {
    getLogger().log("Successfully read " + successReading + " entries from file: " + getFilename());
  }
    `
    },
    {
      name: 'put',
      javaCode: `
        try {
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
        } catch ( Throwable t ) {
          getLogger().error("Failed to sign object", t);
        }
      `
    }
  ]
});
