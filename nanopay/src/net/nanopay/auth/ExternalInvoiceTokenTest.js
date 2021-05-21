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
  package: 'net.nanopay.auth',
  name: 'ExternalInvoiceTokenTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.token.Token',
    'foam.nanos.auth.token.TokenService',
    'foam.util.Auth',
    'java.util.Calendar',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice',
    'static foam.mlang.MLang.*'
  ],

  methods: [{
    name: 'runTest',
    type: 'Void',
    javaCode: `
      DAO bareUserDAO = (DAO) x.get("bareUserDAO");
      DAO userUserDAO = (DAO) x.get("userUserDAO");
      DAO contactDAO = (DAO) x.get("contactDAO");
      DAO invoiceDAO = (DAO) x.get("invoiceDAO");
      DAO tokenDAO = (DAO) x.get("localTokenDAO");
      TokenService externalToken = (TokenService) x.get("externalInvoiceToken");

      Calendar calendar = Calendar.getInstance();

      // Remove existing test contacts and users if exists.
      bareUserDAO.where(EQ(Contact.EMAIL, "samus@example.com")).removeAll();

      User user = new User();
      user.setFirstName("Unit");
      user.setLastName("Test");
      user.setEmail("test.nanopay1@mailinator.com");
      user.setGroup("admin");
      user = (User) bareUserDAO.put(user);
      x = Auth.sudo(x, user);
      
      // Create the test contact to send money to.
      Contact contact = new Contact();
      contact.setEmail("samus@example.com");
      contact.setFirstName("Samus");
      contact.setLastName("Aran");
      contact.setOrganization("Retro Studios");
      contact.setGroup(user.getSpid() + "-sme");
      Contact samus = (Contact) user.getContacts(x).put(contact);

      // Create a payable invoice with the contact as the payee.
      Invoice invoice = new Invoice();
      invoice.setPayeeId(samus.getId());
      invoice.setPayerId(user.getId());
      invoice.setAmount(1);
      invoice.setExternal(true);
      invoice.setDestinationCurrency("CAD");
      invoice.setSourceCurrency("CAD");
      invoice = (Invoice) invoiceDAO.put(invoice);

      // Find generated token and check to see if contact user is associated.

      Token result = (Token) tokenDAO.find(AND(
        EQ(Token.PROCESSED, false),
        GT(Token.EXPIRY, calendar.getTime()),
        EQ(Token.USER_ID, samus.getId())
      ));

      test(result != null, "Generated token for external user on invoice create exists." );

      // Set up actual user.
      User actualUser = new User();
      actualUser.setEmail("samus@example.com");
      actualUser.setFirstName("Samus");
      actualUser.setLastName("Aran");
      actualUser.setOrganization("Retro Studios");
      actualUser.setDesiredPassword("metroid123");
      actualUser.setSpid("nanopay");
      
      // Process Token & Create user
      externalToken.processToken(x, actualUser, result.getData());

      // Get created user from the external token service and check if enabled.
      User tokenUser = (User) userUserDAO.find(EQ(User.EMAIL, "samus@example.com"));

      // test(tokenUser.getEmailVerified() == true, "Process token email verified user.");

      // Get Token and check if processed to true.
      Token processedToken = (Token) tokenDAO.find(AND(
        EQ(Token.PROCESSED, true),
        GT(Token.EXPIRY, calendar.getTime()),
        EQ(Token.DATA, result.getData())
      ));
  
      test(processedToken != null, "External token was processed." );

      // Create new invoice, token should not be created and processed since user exists.
      Invoice invoice2 = new Invoice();
      invoice2.setPayeeId(samus.getId());
      invoice2.setAmount(1);
      invoice2.setDestinationCurrency("CAD");
      invoice2.setSourceCurrency("CAD");
      invoice2 = (Invoice) user.getExpenses(x).put(invoice2);

      Token noToken = (Token) tokenDAO.find(AND(
        EQ(Token.PROCESSED, false),
        GT(Token.EXPIRY, calendar.getTime()),
        EQ(Token.USER_ID, samus.getId())
        ));

      test( noToken == null, "Token for internal user was not created since already exists." );

    `
  }]
});
