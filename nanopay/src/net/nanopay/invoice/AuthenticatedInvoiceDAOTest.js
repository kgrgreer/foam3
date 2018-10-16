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
    'static foam.mlang.MLang.*',
    'foam.nanos.auth.User',
    'foam.nanos.auth.AuthenticationException',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.UserAndGroupAuthService',
    'foam.util.Auth',
    'java.util.List',
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
      DAO invoiceDAO = new foam.dao.SequenceNumberDAO(new MDAO(Invoice.getOwnClassInfo()));

      // need to start auth service
      UserAndGroupAuthService newAuthService = new UserAndGroupAuthService(x);
      newAuthService.start();
      x = x.put("auth", newAuthService);

      DAO dao = new AuthenticatedInvoiceDAO(x, invoiceDAO);

      Invoice invoice = new Invoice();
      invoice.setAmount((long)100);
      invoice.setInvoiceNumber("2165");
      invoice.setPayeeId((long)1368);
      invoice.setPayerId((long)1380);
      invoice = (Invoice) invoiceDAO.put(invoice);

      // Create admin user context
      User admin = new User();
      admin.setId(1300);
      admin.setFirstName("Unit");
      admin.setLastName("Test");
      admin.setEmail("test.nanopay1@mailinator.com");
      admin.setGroup("admin");
      userDAO.put(admin);
      X adminContext = Auth.sudo(x, admin);

      AuthenticatedInvoice_AdminUser(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_Payer(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_Payee(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_BusinessUser(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_ShopperUser(invoice, userDAO, adminContext, dao);

      AuthenticatedInvoice_RemoveRelated(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_RemoveUnrelated(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_DraftInvoice(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_Permission_Creator(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_Permission_Creator_2(invoice, userDAO, adminContext, dao);
      extendedAuthInvoice_DraftInvoice(adminContext, userDAO, dao, invoice);
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
      // Set value change on amount
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(200);

      // Test put_ method with admin user.
      try {
        Invoice inv = (Invoice) dao.put_(x, mutatedInvoice);
        test( inv != null , "Admin user should be able to create & edit an invoice.");
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        test( false, "Admin user should be able to create & edit an invoice.");
      }

      // Test find_ method with admin user
      try {
        Invoice inv = (Invoice) dao.find_(x, mutatedInvoice);
        test( inv != null, "Admin user should be able to find the invoice.");
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        test( false, "Admin user should be able to find the invoice.");
      }

      // Test select_ method with admin user
      ArraySink tempSink = new ArraySink();
      try {
        tempSink = (ArraySink) dao.select_(x, tempSink, 0, 1000, null, null);
        test( tempSink.getArray().size() > 0, "Admin successfully selected invoice.");
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        test( false, "Admin successfully selected invoice.");
      }
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

      // Set value change on amount
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(100);

      // Test put_ method with payee
      try {
        Invoice inv = (Invoice) dao.put_(payeeContext, mutatedInvoice);
        test( inv != null, "Payee (Business user) should be able to create & edit an invoice.");
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        test( false, "Payee (Business user) should be able to create & edit an invoice.");
      }

      // Test find_ method with payee
      try {
        Invoice inv = (Invoice) dao.find_(payeeContext, mutatedInvoice);
        test( inv != null, "Payee (Business user) should be able to find the invoice.");
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        test( false, "Payee (Business user) should be able to find the invoice.");
      }
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

      // Set value change on amount
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(150);

      // Test put_ method with payer
      try {
        Invoice inv = (Invoice) dao.put_(payerContext, mutatedInvoice);
        test( inv != null , "Payer (Business user) should be able to create & edit an invoice.");
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        test( false, "Payer (Business user) should be able to create & edit an invoice.");
      }

      // Test find_ method with payer
      try {
        Invoice inv = (Invoice) dao.find_(payerContext, mutatedInvoice);
        test( inv != null, "Payer (Business user) should be able to find the invoice.");
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        test( false, "Payer (Business user) should be able to find the invoice.");
      }
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

      // Set value change on amount
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(150);

      // Test put_ method with business user
      try {
        Invoice inv = (Invoice) dao.put_(businessUserContext, mutatedInvoice);
        test( false, "Unrelated Business user should not be able to create & edit an invoice.");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        test( message.equals("Permission denied."), "Unrelated Business user should not be able to create & edit an invoice.");
      }

      // Test find_ method with related business user
      try {
        Invoice inv = (Invoice) dao.find_(businessUserContext, mutatedInvoice);
        System.out.println(inv.getStatus());
        test( false, "Unrelated Business user should not be able to find the invoice.");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        if ( ! message.equals("Permission denied.") ) {
          test( false, "Unrelated Business user should not be able to find the invoice.");
        } else {
          test( true, "Unrelated Business user should not be able to find the invoice.");
        }
      }
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

      // Set value change on amount
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(150);

      // Test put_ method with shopper user
      try {
        Invoice inv = (Invoice) dao.put_(shopperContext, mutatedInvoice);
        test( false, "Shopper user should not be able to create & edit an invoice.");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        if ( ! message.equals("Permission denied.") ) {
          test( false, "Shopper user should not be able to create & edit an invoice.");
        } else {
          test( true, "Shopper user should not be able to create & edit an invoice.");
        }
      }

      // Test find_ method with shopper user
      try {
        Invoice inv = (Invoice) dao.find_(shopperContext, invoice);
        test( false, "Shopper user should not be able to find the invoice.");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        if ( ! message.equals("Permission denied.") ) {
          test( false, "Shopper user should not be able to find the invoice.");
        } else {
          test( true, "Shopper user should not be able to find the invoice.");
        }
      }

      // Test select_ method with shopper user
      ArraySink result = (ArraySink)
          dao.select_(shopperContext, new ArraySink(), 0, 1000, null, null);
      test(result.getArray().size() == 0,
          "Shopper user with no related invoice should get empty array for selection.");
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

      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setCreatedBy((long)1380);
      mutatedInvoice.setDraft(true);
      dao.put_(x, mutatedInvoice);

      try {
        dao.remove_(relatedUserContext, mutatedInvoice);
        test(true, "Current user id is equal to the createdBy of the invoice.");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        if ( ! message.equals("Permission denied.") ) {
          test(false, "Current user id is equal to the createdBy of the invoice.");
        } else {
          test(true, "Current user id is equal to the createdBy of the invoice.");
        }
      }
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

      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setCreatedBy((long)1380);
      mutatedInvoice.setDraft(true);
      dao.put_(x, mutatedInvoice);

      try {
        dao.remove_(unrelatedUserContext, mutatedInvoice);
        test(false, "Current user id is NOT equal to the createdBy of the invoice.");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        if ( ! message.equals("Permission denied.") ) {
          test(false, "Current user id is NOT equal to the createdBy of the invoice.");
        } else {
          test(true, "Current user id is NOT equal to the createdBy of the invoice.");
        }
      }

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

       // Set invoice to not be draft
       Invoice mutatedInvoice = (Invoice) invoice.fclone();
       mutatedInvoice.setDraft(false);
       mutatedInvoice.setCreatedBy(1380);
       dao.put_(x, mutatedInvoice);

       try {
         dao.remove_(relatedUserContext, mutatedInvoice);
         test( false, "Should not delete normal invoice.");
       } catch(AuthorizationException t) {
         String message = t.getMessage();
         if (! message.equals("Only invoice drafts can be deleted.") ) {
          test(false, "Should not delete normal invoice.");
         } else {
          test(true, "Should not delete normal invoice.");
         }
       }

       // If invoice is draft
       mutatedInvoice.setDraft(true);
       dao.put_(x, mutatedInvoice);

       try {
         dao.remove_(relatedUserContext, mutatedInvoice);
         test( true, "Able to delete draft invoice.");
       } catch(AuthorizationException t) {
         String message = t.getMessage();
         test( false, "Able to delete draft invoice.");
       }
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

      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setDraft(true);
      dao.put_(x, mutatedInvoice);

      // If user does not have the permission & user is the creator of the invoice
      try {
        dao.remove_(relatedUserContext, mutatedInvoice);
        test(false, "User without the global delete invoice permission can delete the their own draft invoice");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        test(true, "User without the global delete invoice permission can delete the their own draft invoice");
      }

      // If user does not have the permission & user is not the creator of the invoice
      relatedUser.setId(1300);
      userDAO.put(relatedUser);

      try {
        dao.remove_(relatedUserContext, invoice);
        test(false, "User without the global delete invoice permission can only delete the their own draft invoice");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        if (! message.equals("Permission denied.") ) {
          test(false, "User without the global delete invoice permission can only delete the their own draft invoice");
        } else {
          test(true, "User without the global delete invoice permission can only delete the their own draft invoice");
        }
      }
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
      Invoice mutatedInvoice = (Invoice) invoice.fclone();

      // If admin user has the permission & user is the creator of the invoice
      try {
        dao.remove_(x, mutatedInvoice);
        test(false, "Admin user who has the global delete invoice permission can delete the draft invoice");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        test(message.equals("Permission denied."), "Admin user who has the global delete invoice permission can delete the draft invoice");
      }

      // If admin user has the permission & user is not the creator of the invoice
      try {
        dao.remove_(x, mutatedInvoice);
        test(false, "Admin user who has the global delete invoice permission can delete the unrelated draft invoice");
      } catch(AuthorizationException t) {
        String message = t.getMessage();
        if ( message.equals("Permission denied.") ) {
          test( true, "Admin user who has the global delete invoice permission can delete the unrelated draft invoice");
        } else {
          test( false, "Admin user who has the global delete invoice permission can delete the unrelated draft invoice");
        }
      }
    `
  },
  {
    name: 'extendedAuthInvoice_DraftInvoice',
    args: [
      { name: 'x', javaType: 'X' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'authInvoiceDAO', javaType: 'DAO' },
      { name: 'adminPermInvoice', javaType: 'Invoice' }
    ],
    documentation: `Testing put, find, select on invoice Drafts, with the intention of testing permission of access.
                    Tests are sub-sectioned into 3 categories {put, find, select}.
                    dao references are to AuthenticatedInvoiceDAO
                    Put Tests are from Test 1-3
                    --Test 1 : is a basic set into InvoiceDAO used for the remaining 6 tests
                    --Test 2 : regUser puts regUserPermInvoice into dao
                    --Test 3 : regUser puts adminPermInvoice into dao
                    Find Tests are from Test 4-5
                    --Test 4 : regUser finds adminPermInvoice from dao
                    --Test 5 : regUser finds regUserPermInvoice from dao
                    Select Tests are from Test 6-7
                    --Test 6 : regUser selects regUserPermInvoice from dao
                    --Test 7 : regUser selects adminPermInvoice from dao`,
    javaCode: `
    // General Logic: Running user's either admin with global permissions, or regUser with no global permissions
      // Expectation 1) regUser should be able to modify/see regUserPermInvoice, but not adminPermInvoice
      // Expectation 2) admin should be able to modify/see both adminPermInvoice and regUserPermInvoice
      // NOTE: Expectation 2, is not tests here. Admin privilage tests are done @AuthenticatedInvoice_AdminUser(...)

      boolean tester  = false;
      String msg      = "";
      long regUserId  = 1369;
      long payerId    = 1380;
      long invoice_admin_Id   = 100;
      long invoice_regUser_Id = 111;
      long amt        = 100;

      User admin                 = x.get("user");
      User regUser               = new User();
      User payerUser             = new User();

      Invoice regUserPermInvoice = new Invoice();
      Invoice tempInv            = null;

      OrderedSink tempSink       = new OrderedSink();

      payerUser.setId(payerId);
      payerUser.setFirstName("payerUser");
      payerUser.setLastName("payer");
      payerUser.setEmail("payer@mailinator.com");
      payerUser.setGroup("business");

      regUser.setId(regUserId);
      regUser.setFirstName("RelatedUser");
      regUser.setLastName("Account");
      regUser.setEmail("test.related@mailinator.com");
      regUser.setGroup("business");

      // Invoice2: access regUser
      regUserPermInvoice.setAmount(amt);
      regUserPermInvoice.setPayeeId(regUserId);
      regUserPermInvoice.setPayerId(payerId);
      regUserPermInvoice.setDraft(true);

      // Users .put localUserDAO
      userDAO.put(payerUser);
      userDAO.put(regUser);

      DAO invoiceDAO = new foam.nanos.auth.CreatedByAwareDAO.Builder(x).setDelegate(authInvoiceDAO).build();
      
      /* CONTEXT ONE: adminContext */
      // Logic: Running user is admin with global permissions.
      X adminContext = Auth.sudo(x, admin);
      
      /* CONTEXT TWO: regUserContext */
      // Logic: Running user is regUser with no global permissions.
      X regUserContext = Auth.sudo(x, regUser);

      // Invoice1: access admin
      Invoice mutatedInvoice = (Invoice) adminPermInvoice.fclone();
      mutatedInvoice.setDraft(true);

      // Setting Invoice 1 && 2 into invoiceDAO
      adminPermInvoice = (Invoice) invoiceDAO.put_(adminContext, mutatedInvoice);

      // PUT TESTS
      // 1: regUserContext
      // Logic: regUserPermInvoice created by regUser as a draft invoice and should have no restrictions
      tester = false;
      try {
        Invoice inv = (Invoice) invoiceDAO.put_(regUserContext, regUserPermInvoice);
        test(inv != null, "Test 1: Put regUserPermInvoice with regUserContext" + msg);
      } 
      catch (Exception e) {
        System.out.println(e.getMessage());
        e.printStackTrace();
        test(false, "Test 1: Put regUserPermInvoice with regUserContext" + msg);
      }

      // 2: regUserContext
      // Logic: adminPermInvoice was NOT created by regUser as a draft invoice, and should be restricted on put, when accessed by regUser.

      tester = false;
      try {
        invoiceDAO.put_(regUserContext, adminPermInvoice);
        msg = "  test failed: User should NOT have had permission   ";
      } 
      catch (AuthorizationException ae) {
        msg = "  test passed with exception since Invoice is Draft and not created by current user";
        tester = true;
      }
      catch (Exception e) {
        msg = "  test failed with exception  " + e;
        e.printStackTrace();
      }
      test(tester, "Test 2: Put adminPermInvoice with regUserContext" + msg);

      // FIND TESTS
      // find test 3: regUserContext
      // Logic: adminPermInvoice was NOT created by regUser as a draft invoice, and should NOT be found while running as regUser
      tempInv =  null;
      tester = false;
      try {
        tempInv = (Invoice) invoiceDAO.find_(regUserContext, adminPermInvoice.getId());
        msg = "  should have thrown an exception  ";
        if (tempInv == null) tester = true;
      } catch (AuthorizationException ae) {
        msg = "  test passed with exception since Invoice is Draft and not created by current user";
        tester = true;
      } catch (Exception e) {
        msg = "  find into invoiceDAO failed  " + e;
      }
      test(tester, "Test 3: Find adminPermInvoice as regUser" + msg);

      // find test 4: regUserContext
      // Logic: regUserPermInvoice was created by regUser as a draft invoice, and should be found while running as regUser
      tempInv =  null;
      try {
        tempInv = (Invoice) invoiceDAO.find_(regUserContext, regUserPermInvoice.getId());
        msg = "";
      } catch (Exception e) {
        msg = "  find into invoiceDAO failed  " + e;
      }
      test( (tempInv != null && tempInv.getId() == regUserPermInvoice.getId() ), "Test 4: Find regUserPermInvoice as regUser" + msg);

      // SELECT TESTS
      // select test 5 : regUserContext
      // Logic: regUserPermInvoice was created by regUser as a draft invoice, and should be found while running as regUser using .select
      tempSink = new OrderedSink();
      try {
        tempSink = (OrderedSink) invoiceDAO.where(
          EQ(Invoice.ID, regUserPermInvoice.getId()).select_(regUserContext, tempSink, 0, 1, null, null);
        msg = "";
      } catch (Exception e) {
        msg = "  select into AuthenticatedInvoiceDAO failed  " + e;
        e.printStackTrace();
      }
      test(tempSink.getArray().size() > 0, "Test 5: Select regUserPermInvoice with regUser" + msg);

      // select test 6 
      // Logic: adminPermInvoice was NOT created by regUser as a draft invoice, and should be NOT be found while running as regUser using .select
      tempSink = new OrderedSink();
      try {
        tempSink = (OrderedSink) invoiceDAO.where(
        EQ(Invoice.ID, invoice_admin_Id)).select_(regUserContext, tempSink, 0, 1, null, null);
        msg = "";
      } catch (Exception e) {
        msg = "  select into AuthenticatedInvoiceDAO failed  " + e;
        e.printStackTrace();
      }

      test(tempSink.getArray().size() == 0, "Test 6: Select adminPermInvoice with regUser" + msg);
    `
  }
]
});
