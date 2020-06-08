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
  name: 'PayerAssentTransactionDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'net.nanopay.security.KeyPairEntry',
    'net.nanopay.security.PayerAssentTransactionDAO',
    'net.nanopay.security.PublicKeyEntry',
    'net.nanopay.security.UserKeyPairGenerationDAO'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        // set up test context
        x = SecurityTestUtil.CreateSecurityTestContext(x);

        // get keypair & public key dao
        foam.dao.DAO keyPairDAO = (foam.dao.DAO) x.get("keyPairDAO");
        foam.dao.DAO publicKeyDAO = (foam.dao.DAO) x.get("publicKeyDAO");

        // create user key pair generation dao
        foam.dao.DAO userKeyPairGenerationDAO = new UserKeyPairGenerationDAO.Builder(x)
          .setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo()))
          .build();

        // create payer assent transaction dao
        foam.dao.DAO payerAssentTransactionDAO = new PayerAssentTransactionDAO.Builder(x)
          .setDelegate(new foam.dao.MDAO(net.nanopay.tx.model.Transaction.getOwnClassInfo()))
          .build();

        x = x.put("localUserDAO", new foam.nanos.auth.AuthorizationDAO.Builder(x)
          .setAuthorizer(new foam.nanos.auth.AuthorizableAuthorizer(foam.nanos.auth.User.class.getSimpleName().toLowerCase()))
          .setDelegate(new foam.dao.MDAO(foam.nanos.auth.User.getOwnClassInfo()))
          .build());

        // create user
        foam.nanos.auth.User user = new foam.nanos.auth.User.Builder(x)
          .setId(1000)
          .setFirstName("Kirk")
          .setLastName("Eaton")
          .setEmail("kirk@nanopay.net")
          .build();
        ((foam.dao.DAO) x.get("localUserDAO")).put(user);

        user = new foam.nanos.auth.User.Builder(x)
          .setId(1001)
          .setFirstName("Kirk1")
          .setLastName("Eaton1")
          .setEmail("kirk1@nanopay.net")
          .build();
        ((foam.dao.DAO) x.get("localUserDAO")).put(user);

        net.nanopay.tx.model.Transaction tx = new net.nanopay.tx.model.Transaction.Builder(x)
          .setId(java.util.UUID.randomUUID().toString())
          .setPayerId(1000)
          .setPayeeId(1001)
          .setAmount(10000)
          .build();

        // authenticate as user
        x = foam.util.Auth.sudo(x, user);

        // put to user key pair generation dao to create keys
        userKeyPairGenerationDAO.put_(x, user);

        // put to the payer assent transaction dao to sign transaction
        tx = (net.nanopay.tx.model.Transaction) payerAssentTransactionDAO.put_(x, tx);

        // verify signature added
        test(tx != null, "Transaction is not null");
        test(tx.getSignatures() != null, "Transaction signatures is not null");
        test(tx.getSignatures().size() == 1, "Transaction has one signature");

        // get key pair and public key entry
        KeyPairEntry keyPairEntry = (KeyPairEntry) keyPairDAO.inX(x).find(foam.mlang.MLang.EQ(KeyPairEntry.OWNER, user.getId()));
        PublicKeyEntry publicKeyEntry = (PublicKeyEntry) publicKeyDAO.inX(x).find(keyPairEntry.getPublicKeyId());
        java.security.PublicKey publicKey = publicKeyEntry.getPublicKey();

        try {
          // verify signature
          byte[] signature = tx.getSignatures().get(0).getSignature();
          test(tx.verify(signature, publicKey), "PublicKey verifies signature");
        } catch ( Throwable t ) {
          test(false, "PublicKey verifies signature");
        }
      `
    }
  ]
});
