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
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.invoice.PreventRemoveInvoiceDAO',
    'foam.nanos.auth.CreatedByAwareDAO',
    'foam.dao.SequenceNumberDAO'
  ],

  methods: [{
    name: 'runTest',
    javaReturns: 'void',
    javaCode: `
      // Create mock userDAO as localUserDAO
      x = x.put("localUserDAO", new MDAO(User.getOwnClassInfo()));
      DAO userDAO = (DAO) x.get("localUserDAO");

      // Create Auth Service
      UserAndGroupAuthService newAuthService = new UserAndGroupAuthService(x);
      newAuthService.start();
      x = x.put("auth", newAuthService);

      /**
       * Create mock invoiceDAO and wrap it with the sequenceNumberDAO, createdByAwareDAO,
       * PreventRemoveInvoiceDAO and AuthenticatedInvoiceDAO to replicate required DAO behaviour.
      */
      DAO seqInvoiceDAO = new SequenceNumberDAO(new PreventRemoveInvoiceDAO(x, new MDAO(Invoice.getOwnClassInfo())));
      DAO dao = new CreatedByAwareDAO.Builder(x).setDelegate(new AuthenticatedInvoiceDAO(x, seqInvoiceDAO)).build();

      // Create admin user context
      User admin = new User();
      admin.setId(1300);
      admin.setFirstName("Unit");
      admin.setLastName("Test");
      admin.setEmail("test.nanopay1@mailinator.com");
      admin.setGroup("admin");
      userDAO.put(admin);
      X adminContext = Auth.sudo(x, admin);

      // Create test Invoice
      Invoice invoice = new Invoice();
      invoice.setAmount((long)100);
      invoice.setInvoiceNumber("2165");
      invoice.setPayeeId((long)1368);
      invoice.setPayerId((long)1380);

      AuthenticatedInvoice_AdminUser(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_Payer(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_Payee(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_BusinessUser(invoice, userDAO, adminContext, dao);

      AuthenticatedInvoice_RemoveRelated(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_RemoveUnrelated(invoice, userDAO, adminContext, dao);
      AuthenticatedInvoice_RemoveTransactionRelatedInvoice(invoice, userDAO, adminContext, dao);
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
      // Test setup
      boolean threw = false;

      // Test put_ method with admin user.
      try {
        invoice = (Invoice) dao.put_(x, invoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Admin user should be able to create & edit an invoice." );

      // Test find_ method with admin user
      threw = false;
      try {
        invoice = (Invoice) dao.find_(x, invoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Admin user should be able to find the invoice." );

      // Test select_ method with admin user
      threw = false;
      ArraySink tempSink = new ArraySink();
      try {
        tempSink = (ArraySink) dao.select_(x, tempSink, 0, 1000, null, null);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }

      // Testing if select_ method with admin user was really found
      test( tempSink.getArray().size() > 0, "Admin successfully selected invoice.");

      // Clean up
      invoice.setDraft(true);
      invoice = (Invoice) dao.put_(x, invoice);
      invoice = (Invoice) dao.remove_(x, invoice);
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
      // Test setup
      String message = "";
      User payee = new User();
      payee.setId(1368);
      payee.setFirstName("Payee");
      payee.setLastName("Business");
      payee.setEmail("test@mailinator.com");
      payee.setGroup("business");
      userDAO.put(payee);
      X payeeContext = Auth.sudo(x, payee);

      boolean threw = false;

      // Test create new invoice with put_ method as payee
      try {
        invoice = (Invoice) dao.put_(payeeContext, invoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Payee (Business user) should be able to create an invoice." );

      // Test update invoice with put_ method as payee
      // Set value change on amount
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(100);
      threw = false;

      try {
        invoice = (Invoice) dao.put_(payeeContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Payee (Business user) should be able to update an invoice they created." );

      // Test find_ method with payee
      threw = false;
      try {
        invoice = (Invoice) dao.find_(payeeContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Payee (Business user) should be able to find the invoice." );

      // Test put_ method with payee and changing reference Id.
      threw = false;
      mutatedInvoice.setReferenceId("newReferenceId");
      try {
        Invoice inv = (Invoice) dao.put_(payeeContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        message = t.getMessage();
        threw = true;
      }
      test( threw && message.equals("Cannot update reference Id."), "Payee (Business user) should not be able to update reference Id on an invoice." );

      // Clean up
      invoice = (Invoice) dao.remove_(x, invoice);
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
      // Test setup
      String message = "";
      User payer = new User();
      payer.setId(1380);
      payer.setFirstName("payer");
      payer.setLastName("Business");
      payer.setEmail("test@mailinator.com");
      payer.setGroup("business");
      userDAO.put(payer);
      X payerContext = Auth.sudo(x, payer);
      boolean threw = false;

      // Test create new invoice with put_ method as payer
      try {
        invoice = (Invoice) dao.put_(payerContext, invoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Payer (Business user) should be able to put new invoice." );

      // Test updating invoice with put_ method as payer
      // Set value change on amount
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(100);
      threw = false;
      try {
        invoice = (Invoice) dao.put_(payerContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Payer (Business user) should be able to update an invoice they created." );

      // Test find_ method with payer
      threw = false;
      try {
        invoice = (Invoice) dao.find_(payerContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Payer (Business user) should be able to find the invoice." );

      // Test put_ method with payer and changing reference Id
      threw = false;
      mutatedInvoice.setReferenceId("newReferenceId");
      try {
        invoice = (Invoice) dao.put_(payerContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        message = t.getMessage();
        threw = true;
      }
      test( threw && message.equals("Cannot update reference Id."), "Payer (Business user) should not be able to update reference Id on an invoice." );

      // Clean up
      invoice = (Invoice) dao.remove_(x, invoice);
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
      // Test setup
      String message = "";
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

      boolean threw = false;

      // Test create invoice put_ method with business user
      try {
        Invoice inv = (Invoice) dao.put_(businessUserContext, invoice);
      } catch(AuthorizationException t) {
        message = t.getMessage();
        threw = true;
      }
      test( threw && message.equals("Permission denied."), "Unrelated Business user should not be able to create an invoice for other users." );

      // Put invoice and set value change on amount
      invoice = (Invoice) dao.put_(x, invoice);
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(150);

      // Test update invoice put_ method with business user
      try {
        invoice = (Invoice) dao.put_(businessUserContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        message = t.getMessage();
        threw = true;
      }
      test( threw && message.equals("Permission denied."), "Unrelated Business user should not be able to edit an invoice for other users." );

      // Test find_ method with related business user
      threw = false;
      try {
        invoice = (Invoice) dao.find_(businessUserContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        message = t.getMessage();
        threw = true;
      }
      test( threw && message.equals("Permission denied."), "Unrelated Business user should not be able to find the invoice of other users." );

      // Clean up
      invoice = (Invoice) dao.remove_(x, invoice);
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
      // Test setup
      invoice = (Invoice) dao.put_(x, invoice);
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

      boolean threw = false;

      try {
        dao.remove_(relatedUserContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Related user can remove invoice they created." );

      // Clean up invoice previously removed in test.
    `
  },
  {
    name: 'AuthenticatedInvoice_RemoveTransactionRelatedInvoice',
    args: [
      { name: 'invoice', javaType: 'Invoice' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'x', javaType: 'X' },
      { name: 'dao', javaType: 'DAO' }
    ],
    javaCode: `
      // Test setup
      String message = "";
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      x = x.put("localTransactionDAO", new MDAO(Transaction.getOwnClassInfo()));
      DAO transactionDAO = (DAO) x.get("localTransactionDAO");
      Transaction transaction = new Transaction();
      transaction.setId("1");
      transaction.setInvoiceId(mutatedInvoice.getId());
      transaction = (Transaction) transactionDAO.put(transaction);
      dao.put_(x, mutatedInvoice);

      boolean threw = false;

      // Test removing normal invoice with associated transaction as admin.
      try {
        dao.remove_(x, mutatedInvoice);
        invoice = (Invoice) dao.find_(x, mutatedInvoice);
      } catch(AuthorizationException t) {
        threw = true;
      }

      test( ! threw && invoice == null, "Should be able to delete normal invoice with no associated accounts or transactions as admin." );

      dao.put_(x, mutatedInvoice);
      // Test find_ of removed invoice as admin user.
      threw = false;
      try {
        mutatedInvoice = (Invoice) dao.find_(x, mutatedInvoice);
      } catch (Exception e) {
        threw = true;
      }
      test( ! threw && mutatedInvoice != null, "Admin user can find removed invoice." );

      // Test select_ of removed invoice as admin user.
      threw = false;
      ArraySink result = new ArraySink();
      try {
        result = (ArraySink) dao.select_(x, new ArraySink(), 0, 1, null, null);
      } catch (Exception e) {
        e.printStackTrace();
        threw = true;
      }
      test( ! threw && result.getArray().size() != 0, "Admin user can select removed invoices." );

      User relatedUser = new User();
      relatedUser.setId(1380);
      relatedUser.setFirstName("RelatedUser");
      relatedUser.setLastName("Account");
      relatedUser.setEmail("test.related@mailinator.com");
      relatedUser.setGroup("business");
      userDAO.put(relatedUser);
      X relatedUserContext = Auth.sudo(x, relatedUser);

      // Test find_ of removed invoice as related user.
      threw = false;
      try {
        invoice = (Invoice) dao.find_(relatedUserContext, mutatedInvoice);
      } catch (Exception e) {
        e.printStackTrace();
        threw = true;
      }
      test( ! threw && invoice == null, "Related user can't find removed invoice." );

      // Clean up
      transactionDAO.remove(transaction);
      dao.remove_(x, mutatedInvoice);
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
      // Test setup
      invoice = (Invoice) dao.put_(x, invoice);
      String message = "";
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

      boolean threw = false;

      try {
        dao.remove_(unrelatedUserContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        message = t.getMessage();
        threw = true;
      }
      test( threw && message.equals("Permission denied."), "Unrelated user cannot remove unrelated invoice." );

      // Clean up
      dao.remove_(x, mutatedInvoice);
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
      // Test setup
      invoice = (Invoice) dao.put_(x, invoice);
      String message = "";
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
      mutatedInvoice.setDraft(true);
      mutatedInvoice.setCreatedBy(1380);
      dao.put_(x, mutatedInvoice);

      boolean threw = false;
      // Test removing draft invoice as related user.
      try {
        dao.remove_(relatedUserContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Able to delete draft invoice." );

      // Test deleting normal invoice with no associated accounts or transactions as admin.
      mutatedInvoice.setDraft(false);
      dao.put_(x, mutatedInvoice);

      threw = false;
      try {
        dao.remove_(x, mutatedInvoice);
      } catch(AuthorizationException t) {
        message = t.getMessage();
        threw = true;
      }
      test( ! threw, "Should be able to delete normal invoice with no associated accounts or transactions as admin." );

      // Clean up already performed from previous test case.
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
      // Test setup
      invoice = (Invoice) dao.put_(x, invoice);
      String message = "";
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
      mutatedInvoice.setCreatedBy(1380);
      dao.put_(x, mutatedInvoice);

      boolean threw = false;

      // If user does not have the permission & user is the creator of the invoice
      try {
        dao.remove_(relatedUserContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "User without the global delete invoice permission can delete their own draft invoice" );

      // If user does not have the permission & user is not the creator of the invoice
      mutatedInvoice.setCreatedBy(1450);
      dao.put_(x, mutatedInvoice);

      threw = false;
      try {
        dao.remove_(relatedUserContext, invoice);
      } catch(AuthorizationException t) {
        message = t.getMessage();
        threw = true;
      }
      test( threw && message.equals("Permission denied."), "User without the global delete invoice permission can only delete their own draft invoice" );

      // Clean up
      invoice = (Invoice) dao.remove_(x, invoice);
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
      // Test setup
      invoice = (Invoice) dao.put_(x, invoice);

      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setCreatedBy(1380);
      mutatedInvoice.setDraft(false);
      dao.put_(x, mutatedInvoice);

      boolean threw = false;
      // If admin user has the permission & user is the creator of the invoice
      try {
        dao.remove_(x, mutatedInvoice);
      } catch(AuthorizationException t) {
        System.out.println(t.getMessage());
        t.printStackTrace();
        threw = true;
      }
      test( ! threw, "Admin user who has the global delete invoice permission can delete the unrelated draft invoice." );

      // Clean up invoice previously removed in test.
    `
  },
  {
    name: 'extendedAuthInvoice_DraftInvoice',
    args: [
      { name: 'x', javaType: 'X' },
      { name: 'userDAO', javaType: 'DAO' },
      { name: 'invoiceDAO', javaType: 'DAO' },
      { name: 'invoice', javaType: 'Invoice' }
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
      // Test setup
      Invoice adminPermInvoice = (Invoice) invoiceDAO.put_(x, invoice);

      // Admin user from runTest context
      User admin = (User) x.get("user");

      // Payer Business User
      User payerUser = new User();
      payerUser.setId(1380);
      payerUser.setFirstName("payerUser");
      payerUser.setLastName("payer");
      payerUser.setEmail("payer@mailinator.com");
      payerUser.setGroup("business");

      // Regular business user
      User regUser = new User();
      regUser.setId(1369);
      regUser.setFirstName("RelatedUser");
      regUser.setLastName("Account");
      regUser.setEmail("test.related@mailinator.com");
      regUser.setGroup("business");

      // Invoice2: access regUser
      Invoice regUserPermInvoice = new Invoice();
      regUserPermInvoice.setAmount(100);
      regUserPermInvoice.setPayeeId(1369);
      regUserPermInvoice.setPayerId(1380);
      regUserPermInvoice.setDraft(true);

      // Users .put localUserDAO
      userDAO.put(payerUser);
      userDAO.put(regUser);
      
      boolean threw = false;
      String message = "";
      /* CONTEXT TWO: regUserContext */
      // Logic: Running user is regUser with no global permissions.
      X regUserContext = Auth.sudo(x, regUser);

      // PUT TESTS
      // 1: regUserContext
      // Logic: regUserPermInvoice created by regUser as a draft invoice and should have no restrictions
      try {
        Invoice inv = (Invoice) invoiceDAO.put_(regUserContext, regUserPermInvoice);
      } catch (Exception e) {
        System.out.println(e.getMessage());
        e.printStackTrace();
        threw = true;
      }
      test( ! threw, "Test 1: Put regUserPermInvoice with regUserContext" );

      // 2: regUserContext
      // Logic: adminPermInvoice was NOT created by regUser as a draft invoice, and should be restricted on put, when accessed by regUser.
      threw = false;
      try {
        invoiceDAO.put_(regUserContext, adminPermInvoice);
      } catch (AuthorizationException e) {
        message = e.getMessage();
        threw = true;
      }
      test( threw && message.equals("Permission denied."), "Test 2: Cannot put admin created invoice as regular user within context." );

      // FIND TESTS
      // 3: regUserContext
      // Logic: adminPermInvoice was NOT created by regUser as a draft invoice, and should NOT be found while running as regUser
      message = "";
      threw = false;
      try {
        Invoice tempInv = (Invoice) invoiceDAO.find_(regUserContext, adminPermInvoice.getId());
      } catch (AuthorizationException e) {
        message = e.getMessage();
        threw = true;
      }
      test( threw && message.equals("Permission denied."), "Test 3: Find admin created invoice as regular user, find on invoiceDAO failed." );

      // 4: regUserContext
      // Logic: regUserPermInvoice was created by regUser as a draft invoice, and should be found while running as regUser
      threw = false;
      try {
        Invoice tempInv = (Invoice) invoiceDAO.find_(regUserContext, regUserPermInvoice.getId());
      } catch (Exception e) {
        System.out.println(e.getMessage());
        e.printStackTrace();
        threw = true;
      }
      test( ! threw, "Test 4: Find invoice created by regular user as regular user in context." );

      // SELECT TESTS
      // 5: regUserContext
      // Logic: regUserPermInvoice was created by regUser as a draft invoice, and should be found while running as regUser using .select
      ArraySink result = new ArraySink();
      try {
        result = (ArraySink) invoiceDAO.where(
          EQ(Invoice.ID, regUserPermInvoice.getId())).select_(regUserContext, result, 0, 1, null, null);
      } catch (Exception e) {
        e.printStackTrace();
      }
      test( result.getArray().size() != 0, "Test 5: Selecting regular user invoice as regular user" );

      // 6: regUserContext
      // Logic: adminPermInvoice was NOT created by regUser as a draft invoice, and should be NOT be found while running as regUser using .select
      try {
        result = (ArraySink) invoiceDAO.where(
        EQ(Invoice.ID, adminPermInvoice.getId())).select_(regUserContext, new ArraySink(), 0, 1, null, null);
      } catch (Exception e) {
        System.out.println(e.getMessage());
        e.printStackTrace();
      }
      test( result.getArray().size() == 0, "Test 6: Select adminPermInvoice with regUser" );

      // Clean up
      invoiceDAO.remove_(x, adminPermInvoice);
      invoiceDAO.remove_(x, regUserPermInvoice);
    `
  }
]
});
