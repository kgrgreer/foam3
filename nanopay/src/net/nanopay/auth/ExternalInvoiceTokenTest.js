foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ExternalInvoiceTokenTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.mlang.MLang.EQ',
    'foam.nanos.auth.User',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.token.TokenService',
    'foam.util.Auth',
    'foam.nanos.auth.token.Token',
    'net.nanopay.invoice.model.Invoice'
  ],

  methods: [{
    name: 'runTest',
    javaReturns: 'void',
    javaCode: `
      // create mock userDAO as localUserDAO
      DAO userDAO = (DAO) x.get("bareUserDAO");
      DAO localUserDAO = (DAO) x.get("localUserDAO");
      DAO contactDAO = (DAO) x.get("contactDAO");
      DAO tokenDAO = (DAO) x.get("tokenDAO");
      TokenService externalToken = (TokenService) x.get("externalInvoiceToken");

      user = x.get("user");

      // Remove existing contact if exists.
      contactDAO.where(foam.mlang.MLang.EQ(Contact.EMAIL, "samus@example.com")).removeAll();

      // Create the test contact to send money to.
      contact = new Contact();
      contact.setEmail("samus@example.com");
      contact.setFirstName("Samus");
      contact.setLastName("Aran");
      contact.setOrganization("Retro Studios");
      samus = user.getContacts(x).put(contact);

      // Create a payable invoice with the contact as the payee.
      invoice = new Invoice();
      invoice.setPayeeId(samus.getId());
      invoice.setAmount(1);
      invoice.setDestinationCurrency("CAD");
      invoice = user.getExpenses(x).put(invoice);

      // Find generated token and check to see if contact user is associated.
      Sink sink = new ArraySink();

      sink = tokenDAO.where(MLang.AND(
        MLang.EQ(Token.PROCESSED, false),
        MLang.GT(Token.EXPIRY, calendar.getTime()),
        MLang.EQ(Token.USERID, samus.getId())
        )).limit(1).select(sink);
        List list = ((ArraySink) sink).getArray();

      test(list != null && list.size() == 1, "Generated token for external user on invoice create exists." );

      // Set up actual user.
      actualUser = new User();
      actualUser.setEmail("samus@example.com");
      actualUser.setFirstName("Samus");
      actualUser.setLastName("Aran");
      actualUser.setOrganization("Retro Studios");
      actualUser.setDesiredPassword("metroid123");
      actualUser.setSpid("nanopay");

      // Process Token & Create user
      externalToken.processToken(null, actualUser, list.get(0));

      // Get created user from the external token service and check if enabled.
      sink = new ArraySink();

      sink = localUserDAO.where(
        MLang.EQ(User.EMAIL, "samus@example.com")
      ).limit(1).select(sink);

      List userList = ((ArraySink) sink).getArray();
      User processedUser = (User) userList.get(0);

      test(processedUser.getEnabled() == true, "Process token enabled & created user.");
      test(processedUser.getEmailVerified() == true, "Process token email verified user.");

      // Get Token and check if processed to true.
      sink = new ArraySink();

      sink = tokenDAO.where(MLang.AND(
        MLang.EQ(Token.PROCESSED, true),
        MLang.GT(Token.EXPIRY, calendar.getTime()),
        MLang.EQ(Token.USERID, samus.getId())
        )).limit(1).select(sink);
        List list = ((ArraySink) sink).getArray();
  
      test(list != null && list.size() == 1, "External token was processed." );
    `
  }]
});
