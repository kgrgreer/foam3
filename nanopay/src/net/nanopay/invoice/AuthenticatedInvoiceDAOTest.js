foam.CLASS({
  package: 'net.nanopay.invoice',
  name: 'AuthenticatedInvoiceDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.OrderedSink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.nanos.auth.User',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.UserAndGroupAuthService',
    'foam.util.Auth',
    'java.util.List',
    'net.nanopay.invoice.AuthenticatedInvoiceDAO',
    'net.nanopay.invoice.model.Invoice',
    'static foam.mlang.MLang.*'
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

      Invoice invoice = new Invoice();
      invoice.setId((long)100);
      invoice.setAmount((long)100);
      invoice.setInvoiceNumber("2165");
      invoice.setPayeeId((long)1368);
      invoice.setPayerId((long)1380);
      invoiceDAO.put(invoice);

      AuthenticatedInvoice_AdminUser(invoice, userDAO, x, dao);
      AuthenticatedInvoice_Payer(invoice, userDAO, x, dao);
      AuthenticatedInvoice_Payee(invoice, userDAO, x, dao);
      AuthenticatedInvoice_BusinessUser(invoice, userDAO, x, dao);
      AuthenticatedInvoice_ShopperUser(invoice, userDAO, x, dao);
      AuthenticatedInvoice_MerchantUser(invoice, userDAO, x, dao);

      AuthenticatedInvoice_RemoveRelated(invoice, userDAO, x, dao);
      AuthenticatedInvoice_RemoveUnrelated(invoice, userDAO, x, dao);
      AuthenticatedInvoice_DraftInvoice(invoice, userDAO, x, dao);
      AuthenticatedInvoice_Permission_Creator(invoice, userDAO, x, dao);
      AuthenticatedInvoice_Permission_Creator_2(invoice, userDAO, x, dao);
      extendedAuthInvoice_DraftInvoice(x);
    `,
  },
  {
    name: 'AuthenticatedInvoice_AdminUser',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User admin = new User();
      admin.setId(1300);
      admin.setFirstName("Unit");
      admin.setLastName("Test");
      admin.setEmail("test.nanopay1@mailinator.com");
      admin.setGroup("admin");
      userDAO.put(admin);
      X adminContext = Auth.sudo(x, admin);

      boolean threw = false;

      // Test put_ method with admin user
      try {
        dao.put_(adminContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
      }
      test(! threw, "Admin user should be able to create & edit an invoice.");

      // Test find_ method with admin user
      threw = false;
      try {
        dao.find_(adminContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
      }
      test(! threw, "Admin user should be able to find the invoice.");

      // Test select_ method with admin user
      threw = false;
      try {
        dao.select_(adminContext, new ArraySink(), 0, 1000, null, null);
      } catch(AuthorizationException exception) {
        threw = true;
      }
      test(! threw, "Admin user should be able to select invoices.");
    `
  },
  {
    name: 'AuthenticatedInvoice_Payee',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User payee = new User();
      payee.setId(1368);
      payee.setFirstName("Payee");
      payee.setLastName("Business");
      payee.setEmail("test@mailinator.com");
      payee.setGroup("business");
      userDAO.put(payee);
      X payeeContext = Auth.sudo(x, payee);

      boolean threw = false;

      // Test put_ method with payee
      try {
        dao.put_(payeeContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
      }
      test(! threw,
          "Payee (Business user) should be able to create & edit an invoice.");

      // Test find_ method with payee
      threw = false;
      try {
        dao.find_(payeeContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
      }
      test(! threw, "Payee (Business user) should be able to find the invoice.");
    `
  },
  {
    name: 'AuthenticatedInvoice_Payer',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User payer = new User();
      payer.setId(1380);
      payer.setFirstName("payer");
      payer.setLastName("Business");
      payer.setEmail("test@mailinator.com");
      payer.setGroup("business");
      userDAO.put(payer);
      X payerContext = Auth.sudo(x, payer);

      boolean threw = false;

      // Test put_ method with payer
      try {
        dao.put_(payerContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
      }
      test(! threw,
          "Payer (Business user) should be able to create & edit an invoice.");

      // Test find_ method with payer
      threw = false;
      try {
        dao.find_(payerContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
      }
      test(! threw, "Payer (Business user) should be able to find the invoice.");
    `
  },
  {
    name: 'AuthenticatedInvoice_BusinessUser',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User payee = new User();
      payee.setId(1368);
      payee.setFirstName("Payee");
      payee.setLastName("Business");
      payee.setEmail("test@mailinator.com");
      payee.setGroup("business");
      userDAO.put(payee);
      X payeeContext = Auth.sudo(x, payee);

      User businessUser = new User();
      businessUser.setId(1311);
      businessUser.setFirstName("Normal");
      businessUser.setLastName("Business");
      businessUser.setEmail("test@mailinator.com");
      businessUser.setGroup("business");
      userDAO.put(payee);
      X businessUserContext = Auth.sudo(x, businessUser);

      String message = "";
      boolean threw = false;

      // Test put_ method with business user
      try {
        dao.put_(businessUserContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied."),
          "Unrelated Business user should not be able to create & edit an invoice.");

      // Test find_ method with related business user
      threw = false;
      message = "";
      try {
        dao.find_(businessUserContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied."),
          "Unrelated Business user should not be able to find the invoice.");
    `
  },
  {
    name: 'AuthenticatedInvoice_ShopperUser',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User shopper = new User();
      shopper.setId(1350);
      shopper.setFirstName("Shopper");
      shopper.setLastName("Account");
      shopper.setEmail("test@mailinator.com");
      shopper.setGroup("shopper");
      userDAO.put(shopper);
      X shopperContext = Auth.sudo(x, shopper);

      String message = "";
      boolean threw = false;

      // Test put_ method with shopper user
      try {
        dao.put_(shopperContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test( threw && message.equals("Permission denied."),
          "Shopper user should not be able to create & edit an invoice.");

      // Test find_ method with shopper user
      threw = false;
      message = "";
      try {
        dao.find_(shopperContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied."),
          "Shopper user should not be able to find the invoice.");

      // Test select_ method with shopper user
      ArraySink result = (ArraySink)
          dao.select_(shopperContext, new ArraySink(), 0, 1000, null, null);
      test(result.getArray().size() == 0,
          "Shopper user with no related invoice " +
          "should get empty array for selection.");
    `
  },
  {
    name: 'AuthenticatedInvoice_MerchantUser',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User merchant = new User();
      merchant.setId(1350);
      merchant.setFirstName("Merchant");
      merchant.setLastName("Account");
      merchant.setEmail("test@mailinator.com");
      merchant.setGroup("merchant");
      userDAO.put(merchant);
      X merchantContext = Auth.sudo(x, merchant);

      String message = "";
      boolean threw = false;

      // Test put_ method with merchant user
      try {
        dao.put_(merchantContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied."),
          "Merchant user should not be able to create & edit an invoice.");

      // Test find_ method with merchant user
      threw = false;
      message = "";
      try {
        dao.find_(merchantContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied."),
          "Merchant user should not be able to find the invoice.");

      // Test select_ method with merchant user
      ArraySink result = (ArraySink)
          dao.select_(merchantContext, new ArraySink(), 0, 1000, null, null);
      test(result.getArray().size() == 0,
          "Merchant user with no related invoice " +
          "should get empty array for selection.");
    `
  },
  {
    name: 'AuthenticatedInvoice_RemoveRelated',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User relatedUser = new User();
      relatedUser.setId(1380);
      relatedUser.setFirstName("RelatedUser");
      relatedUser.setLastName("Account");
      relatedUser.setEmail("test.related@mailinator.com");
      relatedUser.setGroup("business");
      userDAO.put(relatedUser);
      X relatedUserContext = Auth.sudo(x, relatedUser);
      boolean threw = false;

      invoice.setCreatedBy((long)1380);
      invoice.setDraft(true);

      try {
        dao.remove_(relatedUserContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
      }
      test(! threw, "Current user id is equal to the createdBy of the invoice.");
    `
  },
  {
    name: 'AuthenticatedInvoice_RemoveUnrelated',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User unrelatedUser = new User();
      unrelatedUser.setId(1000);
      unrelatedUser.setFirstName("UnrelatedUser");
      unrelatedUser.setLastName("Account");
      unrelatedUser.setEmail("test.unrelated@mailinator.com");
      unrelatedUser.setGroup("business");
      userDAO.put(unrelatedUser);
      X unrelatedUserContext = Auth.sudo(x, unrelatedUser);

      invoice.setCreatedBy((long)1380);
      invoice.setDraft(true);

      String message = "";
      boolean threw = false;

      try {
        dao.remove_(unrelatedUserContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied."),
          "Current user id is NOT equal to the createdBy of the invoice.");
    `
  },
  {
     name: 'AuthenticatedInvoice_DraftInvoice',
     args: [
       { name: 'invoice', javaType: 'Invoice' },
       { name: 'userDAO', javaType: 'DAO' },
       { name: 'x', javaType: 'X' },
       { name: 'dao', javaType: 'DAO' }
     ],
     javaCode: `
       User relatedUser = new User();
       relatedUser.setId(1380);
       relatedUser.setFirstName("RelatedUser");
       relatedUser.setLastName("Account");
       relatedUser.setEmail("test.related@mailinator.com");
       relatedUser.setGroup("business");
       userDAO.put(relatedUser);
       X relatedUserContext = Auth.sudo(x, relatedUser);
       boolean threw = false;

       // if invoice is draft
       invoice.setDraft(true);
       try {
         dao.remove_(relatedUserContext, invoice);
       } catch(AuthorizationException exception) {
         threw = true;
       }
       test(! threw, "Able to delete draft invoice.");


       // If invoice is not draft
       invoice.setDraft(false);
       String message = "";
       threw = false;

       try {
         dao.remove_(relatedUserContext, invoice);
       } catch(AuthorizationException exception) {
         threw = true;
         message = exception.getMessage();
       }
       test(threw && message.equals("Only invoice drafts can be deleted."),
           "Should not delete normal invoice.");

     `
  },
  {
    name: 'AuthenticatedInvoice_Permission_Creator',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User relatedUser = new User();
      relatedUser.setId(1380);
      relatedUser.setFirstName("RelatedUser");
      relatedUser.setLastName("Account");
      relatedUser.setEmail("test.related@mailinator.com");
      relatedUser.setGroup("business");
      userDAO.put(relatedUser);
      X relatedUserContext = Auth.sudo(x, relatedUser);

      invoice.setDraft(true);
      String message = "";
      boolean threw = false;

      // If user does not have the permission & user is the creator of the invoice
      try {
        dao.remove_(relatedUserContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(! threw, "User without the global delete invoice permission can delete the their own draft invoice");

      // If user does not have the permission & user is not the creator of the invoice
      relatedUser.setId(1300);
      threw = false;
      try {
        dao.remove_(relatedUserContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(threw && message.equals("Permission denied."),
          "User without the global delete invoice permission can only delete the their own draft invoice");
    `
  },
  {
    name: 'AuthenticatedInvoice_Permission_Creator_2',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      User adminUser = new User();
      adminUser.setId(1000);
      adminUser.setFirstName("admin");
      adminUser.setLastName("Account");
      adminUser.setEmail("test.admin@mailinator.com");
      adminUser.setGroup("admin");
      userDAO.put(adminUser);
      X adminUserContext = Auth.sudo(x, adminUser);

      invoice.setDraft(true);
      String message = "";
      boolean threw = false;

      // If admin user has the permission & user is the creator of the invoice
      try {
        dao.remove_(adminUserContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(! threw, "Admin user who has the global delete invoice permission can delete the draft invoice");

      // If admin user has the permission & user is not the creator of the invoice
      threw = false;
      try {
        dao.remove_(adminUserContext, invoice);
      } catch(AuthorizationException exception) {
        threw = true;
        message = exception.getMessage();
      }
      test(! threw, "Admin user who has the global delete invoice permission can delete the unrelated draft invoice");
    `
  },
  {
    name: 'extendedAuthInvoice_DraftInvoice',
    args: [
      { name: 'x', javaType: 'X' },
    ],
    documentation: `Testing put, find, select on invoice Drafts, with the intention of testing permission of access.
                    Tests are sub-sectioned into 3 categories {put, find, select}.
                    dao references are to AuthenticatedInvoiceDAO
                    Put Tests are from Test 1-5
                    --Test 1 : is a basic set into InvoiceDAO used for the remaining 12 tests
                    --Test 2 : admin puts invoice1 into dao
                    --Test 3 : relatedUser puts invoice2 into dao
                    --Test 4 : admin puts invoice2 into dao
                    --Test 5 : relatedUser puts invoice1 into dao
                    Find Tests are from Test 6-9
                    --Test 6 : admin finds invoice1 from dao
                    --Test 7 : admin finds invoice2 from dao
                    --Test 8 : relatedUser finds invoice1 from dao
                    --Test 9 : relatedUser finds invoice2 from dao
                    Select Tests are from Test 10-13
                    --Test 10 : admin selects invoice1 from dao
                    --Test 11 : relatedUser selects invoice2 from dao
                    --Test 12 : admin selects invoice2 from dao
                    --Test 13 : relatedUser selects invoice1 from dao`,
    javaCode: `
    // General Logic: Running user's either admin with global permissions, or relatedUser with no global permissions
      //Hence 1) relatedUser should be able to modify/see invoice2, but not invoice1
      //Hence 2) admin should be able to modify/see both invoice1 and invoice2

      boolean tester = false;
      String msg   = "";
      long id      = 1380;
      long adminId = 1300;
      long prId    = 1381;
      long inId    = 1383;
      long in2Id   = 1384;
      long amt     = 100;
      String inNu  = (id+5) + "";

      User admin       = new User();
      User relatedUser = new User();
      User payerUser   = new User();
      Invoice invoice  = new Invoice();
      Invoice invoice2 = new Invoice();
      Invoice tempInv  = null;
      OrderedSink tempSink = new OrderedSink();

      admin.setId(adminId);
      admin.setFirstName("Unit");
      admin.setLastName("Test");
      admin.setEmail("test.nanopay1@mailinator.com");
      admin.setGroup("admin");

      payerUser.setId(prId);
      payerUser.setFirstName("payerUser");
      payerUser.setLastName("payer");
      payerUser.setEmail("payer@mailinator.com");
      payerUser.setGroup("business");

      relatedUser.setId(id);
      relatedUser.setFirstName("RelatedUser");
      relatedUser.setLastName("Account");
      relatedUser.setEmail("test.related@mailinator.com");
      relatedUser.setGroup("business");

      // Invoice1: access admin
      invoice.setId(inId);
      invoice.setAmount(amt);
      invoice.setInvoiceNumber(inNu);
      invoice.setPayeeId(adminId);
      invoice.setPayerId(prId);
      invoice.setDraft(true);
      invoice.setDestinationCurrency("CAD");

      // Invoice2: access relatedUser
      invoice2.setId(in2Id);
      invoice2.setAmount(amt);
      invoice2.setInvoiceNumber(inNu);
      invoice2.setPayeeId(id);
      invoice2.setPayerId(prId);
      invoice2.setDraft(true);

      // Users .put localUserDAO
      DAO userDAO = (DAO) x.get("localUserDAO");
      userDAO.put(admin);
      userDAO.put(payerUser);
      userDAO.put(relatedUser);

/* CONTEXT ONE: adminContext */
// Logic: Running user is admin with global permissions.
      X adminContext = Auth.sudo(x, admin);
      DAO inDAO = new foam.nanos.auth.CreatedByAwareDAO.Builder(adminContext).setDelegate(new MDAO(Invoice.getOwnClassInfo())).build();
      DAO dao = new AuthenticatedInvoiceDAO(adminContext, inDAO);

      UserAndGroupAuthService newAuthService = new UserAndGroupAuthService(adminContext);
      newAuthService.start();
      adminContext = adminContext.put("auth", newAuthService);

/* CONTEXT TWO: relatedUserContext */
// Logic: Running user is relatedUser with no global permissions.
      X relatedUserContext = Auth.sudo(x, relatedUser);
      DAO inDAO2 = new foam.nanos.auth.CreatedByAwareDAO.Builder(relatedUserContext).setDelegate(new MDAO(Invoice.getOwnClassInfo())).build();
      DAO dao2 = new AuthenticatedInvoiceDAO(relatedUserContext, inDAO);

      UserAndGroupAuthService newAuthServ = new UserAndGroupAuthService(relatedUserContext);
      newAuthServ.start();
      relatedUserContext = relatedUserContext.put("auth", newAuthServ);

// PUT TESTS
    // Put test 1: adminContext && relatedUserContext
      // Logic: Setting Invoice 1 && 2 into invoiceDAO
      try {
        inDAO.put(invoice);
        inDAO2.put(invoice2);
        tester = true;
      } 
      catch (Exception e) {
        msg = "  put test 1 failed  " + e;
        e.printStackTrace();
        tester = false;
      }
      test(tester, "Test 1: Basic Invoice Put Test" + msg);

    // Put test 2: adminContext
      // Logic: Invoice exists and should have no restrictions on put, since creator is modifying
      try {
        dao.put_(adminContext, invoice);
        tester = true;
        msg = "";
      } 
      catch (Exception e) {
        msg = "  put test 2 failed  " + e;
        e.printStackTrace();
        tester = false;
      }
      test(tester, "Test 2: Put invoice1 with adminContext" + msg);
      
    // Put test 3: relatedUserContext
      // Logic: Invoice2 exists and should have no restrictions on put
      try {
        dao2.put_(relatedUserContext, invoice2);
        tester = true;
        msg = "";
      } 
      catch (Exception e) {
        msg = "  test failed with exception  " + e;
        e.printStackTrace();
        tester = false;
      }
      test(tester, "Test 3: Put invoice2 with relatedUserContext" + msg);

    // Put test 4: adminContext
      // Logic: Invoice2 exists and should have no restrictions on put
      try {
        dao.put_(adminContext, invoice2);
        tester = true;
        msg = "";
      } 
      catch (Exception e) {
        msg = "  test failed with exception  " + e;
        e.printStackTrace();
        tester = false;
      }
      test(tester, "Test 4: Put invoice2 with adminContext" + msg);

    // Put test 5: relatedUserContext
      // Logic: Invoice should have restrictions on put, Invoice is Draft and not created by current user
      try {
        dao2.put_(relatedUserContext, invoice);
        tester = false;
        msg = "  test failed: User should NOT have had permission   ";
      } 
      catch (AuthorizationException ae) {
        msg = "  test passed with exception since Invoice is Draft and not created by current user";
        tester = true;
      }
      catch (Exception e) {
        msg = "  test failed with exception  " + e;
        e.printStackTrace();
        tester = false;
      }
      test(tester, "Test 5: Put invoice1 with relatedUserContext" + msg);

// FIND TESTS
    // Find test 6: adminContext
      // Logic: Invoice1 should be found while running as admin
      try {
        tempInv = (Invoice) dao.find_(adminContext, inId);
        tester = true;
        msg = "";
      } catch (Exception e) {
        msg = "  find into invoiceDAO failed  " + e;
        e.printStackTrace();
        tester = false;
      }
      test(tester, "Test 6: Find invoice1 as admin" + msg);
    // find test 6A
      // Logic: testing if Invoice1 was really found
      if ( tempInv == null ) {
        tester = false;
        msg = "  find fails without an exception thrown  ";
      } else {
        tester = true;
        if ( tempInv.getId() != inId ) { 
          tester = false;
          msg = "  find fails without an exception thrown  ";
        }
      }
      test(tester, "Test 6A: Confirm Find at test6" + msg);

    // find test 7: adminContext
      // Logic: Invoice2 should be found while running as admin
      tempInv =  null;
      try {
        tempInv = (Invoice) dao.find_(adminContext, in2Id);
        msg = "";
        tester = true;
      } catch (Exception e) {
        msg = "  find into invoiceDAO failed  " + e;
        tester = false;
      }
      test(tester, "Test 7: Find invoice2 as admin" + msg);
    // find test 7A
      // Logic: testing if Invoice2 was really found
      if ( tempInv == null) {
        tester = false;
        msg += "  find fails without an exception thrown  ";
      } else {
        if ( tempInv.getId() != in2Id ) { 
          tester = false;
          msg += "  find fails without an exception thrown  ";
        }
      }
      test(tester, "Test 7A: Confirm Find at test7" + msg);

    // find test 8: relatedUserContext
      // Logic: Invoice1 should not be found while running as relatedUser
      tempInv =  null;
      try {
        tempInv = (Invoice) dao2.find_(relatedUserContext, inId);
        tester = false;
        msg = "  should have thrown an exception  ";
      } catch (AuthorizationException ae) {
        msg = "  test passed with exception since Invoice is Draft and not created by current user";
        tester = true;
      } catch (Exception e) {
        msg = "  find into invoiceDAO failed  " + e;
        tester = false;
      }
      test(tester, "Test 8: Find invoice1 as relatedUser" + msg);

    // find test 9: relatedUserContext
      // Logic: Invoice2 should be found while running as relatedUser
      tempInv =  null;
      try {
        tempInv = (Invoice) dao2.find_(relatedUserContext, in2Id);
        msg = "";
        tester = true;
      } catch (Exception e) {
        msg = "  find into invoiceDAO failed  " + e;
        tester = false;
      }
      test(tester, "Test 9: Find invoice2 as relatedUser" + msg);
    // find test 9A
      // Logic: testing if Invoice2 was really found
      if ( tempInv == null) {
        tester = false;
        msg += "  find fails without an exception thrown  ";
      } else {
        if ( tempInv.getId() != in2Id ) { 
          tester = false;
          msg += "  find fails without an exception thrown  ";
        }
      }
      test(tester, "Test 9A: Confirm Find at test9" + msg);

// SELECT TESTS
    // select test 10: adminContext
      // Logic: Invoice1 should be found as admin using .select
      try {
        tempSink = (OrderedSink) dao.where(
          EQ(Invoice.ID, inId)).select_(adminContext, tempSink, 0, 1, null, null);
        tester = true;
        msg = "";
      } catch (Exception e) {
        msg = "  select into AuthenticatedInvoiceDAO failed  " + e;
        e.printStackTrace();
        tester = false;
      }
      test(tester, "Test 10: Select invoice1 with admin" + msg);
    // select test 10A
      // Logic: testing if Invoice1 was really found with select
      if ( tempSink.getArray().size() == 0 ) {
        tester = false;
        msg = "  select fails without an exception thrown  ";
      } else {
        tester = true;
      }
      test(tester, "Test 10A: Confirm select at test10" + msg);

    // select test 11 : relatedUserContext
       // Logic: Invoice2 should be found while running as relatedUser using .select
       tempSink = new OrderedSink();
       try {
         tempSink = (OrderedSink) dao2.where(
           EQ(Invoice.ID, in2Id)).select_(relatedUserContext, tempSink, 0, 1, null, null);
         tester = true;
         msg = "";
       } catch (Exception e) {
         msg = "  select into AuthenticatedInvoiceDAO failed  " + e;
         e.printStackTrace();
         tester = false;
       }
       test(tester, "Test 11: Select invoice2 with relatedUser" + msg);
    // select test 11A
       // Logic: testing if Invoice2 was really found with select
       if ( tempSink.getArray().size() == 0 ) {
         tester = false;
         msg = "  select fails without an exception thrown  ";
       } else {
         tester = true;
       }
       test(tester, "Test 11A: Confirm select at test11" + msg);

    // select test 12: admin
       // Logic: Invoice2 should be found while running as admin using .select
       tempSink = new OrderedSink();
       try {
        tempSink = (OrderedSink) dao.where(
          EQ(Invoice.ID, in2Id)).select_(adminContext, tempSink, 0, 1, null, null);
        tester = true;
        msg = "";
       } catch (Exception e) {
        msg = "  select into AuthenticatedInvoiceDAO failed  " + e;
        e.printStackTrace();
        tester = false;
       }
       test(tester, "Test 12: Select invoice2 with admin" + msg);
    // select test 12A
       // Logic: testing if Invoice2 was really found with select
       if ( tempSink.getArray().size() == 0 ) {
         tester = false;
         msg = "  select fails without an exception thrown  ";
       } else {
         tester = true;
       }
       test(tester, "Test 12A: Confirm select test12" + msg);

    // select test 13 
       // Logic: Invoice1 should be not be found while running as relatedUser using .select
       tempSink = new OrderedSink();
       try {
        tempSink = (OrderedSink) dao2.where(
          EQ(Invoice.ID, inId)).select_(relatedUserContext, tempSink, 0, 1, null, null);
        tester = true;
        msg = "";
       } catch (Exception e) {
        msg = "  select into AuthenticatedInvoiceDAO failed  " + e;
        e.printStackTrace();
        tester = false;
       }
       test(tester, "Test 13: Select invoice1 with relatedUser" + msg);
    // select test 13A
       // Logic: testing if Invoice1 was really found with select
       if ( tempSink.getArray().size() == 0 ) {
         tester = true;
         msg = "  select passes with no invoice found  ";
       } else {
         tester = false;
         msg = "  select fails because it found an invoice it should not have  ";
       }
       test(tester, "Test 13A: Confirm select test13" + msg);
    `
  },


]
});
