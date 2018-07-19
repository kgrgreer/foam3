foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'AuthenticatedInvoiceDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserAndGroupAuthService',
    'foam.util.Auth',
    'net.nanopay.invoice.AuthenticatedInvoiceDAO',
    'net.nanopay.invoice.model.Invoice'
  ],

  methods: [{
    name: 'runTest',
    javaReturns: 'void',
    javaCode: `
      // create mock userDAO as localUserDAO
      x = x.put("localUserDAO", new MDAO(User.getOwnClassInfo()));
      DAO userDAO = (DAO) x.get("localUserDAO");
      // create mock invoiceDAO
      DAO invoiceDAO = new MDAO(Invoice.getOwnClassInfo());
      
      // need to start auth service
      UserAndGroupAuthService newAuthService = new UserAndGroupAuthService(x);
      newAuthService.start();
      x = x.put("auth", newAuthService);
      
      DAO dao = new AuthenticatedInvoiceDAO(x, invoiceDAO);
      
      User admin = new User();
      admin.setId(1300);
      admin.setFirstName("Unit");
      admin.setLastName("Test");
      admin.setEmail("test.nanopay1@mailinator.com");
      admin.setGroup("admin");
      userDAO.put(admin);
      X adminContext = Auth.sudo(x, admin);
      
      Invoice invoice = new Invoice();
      invoice.setId((long)100);
      invoice.setAmount((long)100);
      invoice.setInvoiceNumber("2165");
      invoice.setPayeeId((long)1368);
      invoice.setPayerId((long)1380);
      invoiceDAO.put(invoice);
      
      String message = "";
      boolean threw = false;
      
      // Test put_ method with admin user
      try {
          dao.put_(adminContext, invoice);
      } catch (IllegalArgumentException exception) {
          threw = true;
      }
      test(! threw, "Admin user should be able to create & edit an invoice.");
      
      // Test find_ method with admin user
      threw = false;
      try {
          dao.find_(adminContext, invoice);
      } catch (IllegalArgumentException exception) {
          threw = true;
      }
      test(! threw, "Admin user should be able to find the invoice.");
      
      // Test select_ method with admin user
      threw = false;
      try {
          dao.select_(adminContext, new ArraySink(), 0, 1000, null, null);
      } catch (IllegalArgumentException exception) {
          threw = true;
      }
      test(! threw, "Admin user should be able to select invoices.");
      
      User payee = new User();
      payee.setId(1368);
      payee.setFirstName("Payee");
      payee.setLastName("Business");
      payee.setEmail("test@mailinator.com");
      payee.setGroup("business");
      userDAO.put(payee);
      X payeeContext = Auth.sudo(x, payee);
      
      User payer = new User();
      payer.setId(1380);
      payer.setFirstName("payer");
      payer.setLastName("Business");
      payer.setEmail("test@mailinator.com");
      payer.setGroup("business");
      userDAO.put(payer);
      X payerContext = Auth.sudo(x, payer);
      
      // Test put_ method with payee
      threw = false;
      try {
        dao.put_(payeeContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
      }
      test(! threw, "Payee (Business user) should be able to create & edit an invoice.");
      
      // Test find_ method with payee
      threw = false;
      try {
        dao.find_(payeeContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
      }
      test(! threw, "Payee (Business user) should be able to find the invoice.");
      
      // Test put_ method with payer
      threw = false;
      try {
        dao.put_(payerContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
      }
      test(! threw, "Payer (Business user) should be able to create & edit an invoice.");
      
      // Test find_ method with payer
      threw = false;
      try {
        dao.find_(payerContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
      }
      test(! threw, "Payer (Business user) should be able to find the invoice.");
      
      User businessUser = new User();
      businessUser.setId(1311);
      businessUser.setFirstName("Normal");
      businessUser.setLastName("Business");
      businessUser.setEmail("test@mailinator.com");
      businessUser.setGroup("business");
      userDAO.put(payee);
      X businessUserContext = Auth.sudo(x, businessUser);
      
      // Test put_ method with related business user
      threw = false;
      message = "";
      try {
        dao.put_(businessUserContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied"),
          "Unrelated Business user should not be able to create & edit an invoice.");
      
      // Test find_ method with related business user
      threw = false;
      message = "";
      try {
        dao.find_(businessUserContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied"),
          "Unrelated Business user should not be able to find the invoice.");
      
      User shopper = new User();
      shopper.setId(1350);
      shopper.setFirstName("Shopper");
      shopper.setLastName("Account");
      shopper.setEmail("test@mailinator.com");
      shopper.setGroup("shopper");
      userDAO.put(shopper);
      X shopperContext = Auth.sudo(x, shopper);
      
      // Test put_ method with shopper user
      threw = false;
      message = "";
      try {
        dao.put_(shopperContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test( threw && message.equals("Permission denied"),
          "Shopper user should not be able to create & edit an invoice.");
      
      // Test find_ method with shopper user
      threw = false;
      message = "";
      try {
        dao.find_(shopperContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied"),
          "Shopper user should not be able to find the invoice.");
      
      // Test select_ method with shopper user
      threw = false;
      message = "";
      try {
          dao.select_(shopperContext, new ArraySink(), 0, 1000, null, null);
      } catch (IllegalArgumentException exception) {
          threw = true;
          message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied"),
          "Shopper user should not be able to select invoices.");
      
      User merchant = new User();
      merchant.setId(1350);
      merchant.setFirstName("Merchant");
      merchant.setLastName("Account");
      merchant.setEmail("test@mailinator.com");
      merchant.setGroup("merchant");
      userDAO.put(merchant);
      X merchantContext = Auth.sudo(x, merchant);
      
      // Test put_ method with merchant user
      threw = false;
      message = "";
      try {
          dao.put_(merchantContext, invoice);
      } catch (IllegalArgumentException exception) {
          threw = true;
          message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied"),
          "Merchant user should not be able to create & edit an invoice.");
      
      // Test find_ method with merchant user
      threw = false;
      message = "";
      try {
        dao.find_(merchantContext, invoice);
      } catch (IllegalArgumentException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied"),
          "Merchant user should not be able to find the invoice.");
      
      
      // Test select_ method with merchant user
      threw = false;
      message = "";
      try {
          dao.select_(merchantContext, new ArraySink(), 0, 1000, null, null);
      } catch (IllegalArgumentException exception) {
          threw = true;
          message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied"),
          "Merchant user should not be able to select invoices.");
    `,
  },
]

});
