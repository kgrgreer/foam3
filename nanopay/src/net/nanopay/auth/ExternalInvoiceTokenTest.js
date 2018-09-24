foam.CLASS({
  package: 'net.nanopay.auth',
  name: 'ExternalInvoiceTokenTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.auth.token.TokenService',
    'foam.util.Auth',
    'java.util.Calendar',
    'java.util.List',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice'
  ],

  methods: [{
    name: 'runTest',
    javaReturns: 'void',
    javaCode: `
      DAO userDAO = (DAO) x.get("bareUserDAO");
      DAO localUserDAO = (DAO) x.get("localUserDAO");
      DAO contactDAO = (DAO) x.get("contactDAO");
      DAO tokenDAO = (DAO) x.get("tokenDAO");
      User user = (User) x.get("user");
      TokenService externalToken = (TokenService) x.get("externalInvoiceToken");

      Calendar calendar = Calendar.getInstance();

      // Remove existing contact if exists.
      contactDAO.where(foam.mlang.MLang.EQ(Contact.EMAIL, "samus@example.com")).removeAll();

      // Remove existing user if exists.
      localUserDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "samus@example.com")).removeAll();

      // Create the test contact to send money to.
      Contact contact = new Contact();
      contact.setEmail("samus@example.com");
      contact.setFirstName("Samus");
      contact.setLastName("Aran");
      contact.setOrganization("Retro Studios");
      Contact samus = (Contact) user.getContacts(x).put(contact);

      // Create a payable invoice with the contact as the payee.
      Invoice invoice = new Invoice();
      invoice.setPayeeId(samus.getId());
      invoice.setAmount(1);
      invoice.setDestinationCurrency("CAD");
      invoice = (Invoice) user.getExpenses(x).put(invoice);

      // Find generated token and check to see if contact user is associated.
      Sink sink = new ArraySink();

      sink = tokenDAO.where(foam.mlang.MLang.AND(
        foam.mlang.MLang.EQ(Token.PROCESSED, false),
        foam.mlang.MLang.GT(Token.EXPIRY, calendar.getTime()),
        foam.mlang.MLang.EQ(Token.USER_ID, samus.getId())
        )).limit(1).select(sink);
        List list = ((ArraySink) sink).getArray();

      test(list != null && list.size() == 1, "Generated token for external user on invoice create exists." );

      // Set up actual user.
      User actualUser = new User();
      actualUser.setEmail("samus@example.com");
      actualUser.setFirstName("Samus");
      actualUser.setLastName("Aran");
      actualUser.setOrganization("Retro Studios");
      actualUser.setDesiredPassword("metroid123");
      actualUser.setSpid("nanopay");
      
      // Process Token & Create user
      Token token = (Token) list.get(0);
      externalToken.processToken(null, actualUser, token.getData());

      // Get created user from the external token service and check if enabled.
      sink = new ArraySink();

      sink = localUserDAO.where(
        foam.mlang.MLang.EQ(User.EMAIL, "samus@example.com")
      ).limit(1).select(sink);

      List userList = ((ArraySink) sink).getArray();
      User processedUser = (User) userList.get(0);

      test(processedUser.getEnabled() == true, "Process token enabled & created user.");
      test(processedUser.getEmailVerified() == true, "Process token email verified user.");

      // Get Token and check if processed to true.
      sink = new ArraySink();

      sink = tokenDAO.where(foam.mlang.MLang.AND(
        foam.mlang.MLang.EQ(Token.PROCESSED, true),
        foam.mlang.MLang.GT(Token.EXPIRY, calendar.getTime()),
        foam.mlang.MLang.EQ(Token.DATA, token.getData())
        )).limit(1).select(sink);
        list = ((ArraySink) sink).getArray();
  
      test(list != null && list.size() == 1, "External token was processed." );
    `
  }]
});
