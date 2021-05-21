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
  package: 'net.nanopay.invoice',
  name: 'AuthenticatedInvoiceDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.SequenceNumberDAO',
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.CreatedByAwareDAO',
    'foam.nanos.auth.LifecycleState',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserAndGroupAuthService',
    'foam.util.Auth',

    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.model.Transaction',
    'static foam.mlang.MLang.*'
  ],

  methods: [{
    name: 'runTest',
    type: 'Void',
    javaCode: `
      // Create mock userDAO as localUserDAO
      x = x.put("localUserDAO", new MDAO(User.getOwnClassInfo()));
      DAO userDAO = (DAO) x.get("localUserDAO");

      // Create Auth Service
      UserAndGroupAuthService newAuthService = new UserAndGroupAuthService(x);
      try {
        newAuthService.start();
      } catch ( Throwable t ) {
        test(false, "User and group auth shouldn't be throwing exceptions.");
      }
      x = x.put("auth", newAuthService);

      x = x.put("localTransactionDAO", new MDAO(Transaction.getOwnClassInfo()));
      DAO transactionDAO = (DAO) x.get("localTransactionDAO");

      /**
       * Create mock invoiceDAO and wrap it with the sequenceNumberDAO, createdByAwareDAO
       * and AuthenticatedInvoiceDAO to replicate required DAO behaviour.
      */

      DAO lifecycleAwareDAO = new foam.nanos.auth.LifecycleAwareDAO.Builder(x)
       .setDelegate(new MDAO(Invoice.getOwnClassInfo()))
       .setName("invoice")
       .build();

      DAO seqInvoiceDAO = new foam.dao.SequenceNumberDAO.Builder(x).setDelegate(lifecycleAwareDAO).build();
      DAO invoiceDAO = new CreatedByAwareDAO.Builder(x).setDelegate(new AuthenticatedInvoiceDAO(x, seqInvoiceDAO)).build();

      // Create admin user context
      User admin = new User();
      admin.setId(1300);
      admin.setFirstName("Unit");
      admin.setLifecycleState(LifecycleState.ACTIVE);
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
      invoice = (Invoice) invoiceDAO.put_(adminContext, invoice);
      invoice = (Invoice) invoice.fclone();

      AuthenticatedInvoice_AdminUser(invoice, userDAO, adminContext, invoiceDAO);
      AuthenticatedInvoice_Payee(invoice, userDAO, adminContext, invoiceDAO);
      AuthenticatedInvoice_Payer(invoice, userDAO, adminContext, invoiceDAO);
      AuthenticatedInvoice_BusinessUser(invoice, userDAO, adminContext, invoiceDAO);

      AuthenticatedInvoice_RemoveTransactionRelatedInvoice(invoice, userDAO, adminContext, invoiceDAO, transactionDAO);
      AuthenticatedInvoice_RemoveRelated(invoice, userDAO, adminContext, invoiceDAO, transactionDAO);
      AuthenticatedInvoice_RemoveUnrelated(invoice, userDAO, adminContext, invoiceDAO);
      AuthenticatedInvoice_DraftInvoice(invoice, userDAO, adminContext, invoiceDAO);
      extendedAuthInvoice_DraftInvoice(adminContext, userDAO, invoiceDAO, invoice);
    `,
  },
  {
    name: 'AuthenticatedInvoice_AdminUser',
    args: [
      { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
      { name: 'userDAO', type: 'foam.dao.DAO' },
      { name: 'x', type: 'Context' },
      { name: 'dao', type: 'foam.dao.DAO' }
    ],
    javaCode: `
      // Test setup
      // dao.remove_(x, invoice);
      boolean threw = false;

      // Test create new put_ method with admin user.
      try {
        invoice = (Invoice) dao.put_(x, invoice);
      } catch(AuthorizationException t) {
        threw = true;
      }
      test( ! threw, "Admin user should be able to create an invoice." );

      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setAmount(1337);
      // Test editing existing invoice put_ method with admin user.
      threw = false;
      try {
        invoice = (Invoice) dao.put_(x, mutatedInvoice);
      } catch(AuthorizationException t) {
        threw = true;
      }
      test( ! threw, "Admin user should be able to edit an invoice." );

      // Test find_ method with admin user
      threw = false;
      try {
        invoice = (Invoice) dao.find_(x, invoice);
      } catch(AuthorizationException t) {
        threw = true;
      }
      test( ! threw, "Admin user should be able to find the invoice." );

      // Test select_ method with admin user
      threw = false;
      ArraySink tempSink = new ArraySink();
      try {
        tempSink = (ArraySink) dao.select_(x, tempSink, 0, 1000, null, null);
      } catch(AuthorizationException t) {
        threw = true;
      }

      // Testing if select_ method with admin user was really found
      test( ! threw && tempSink.getArray().size() > 0, "Admin successfully selected invoice.");

      // Clean up
      dao.remove_(x, invoice);
    `
  },
  {
    name: 'AuthenticatedInvoice_Payee',
    args: [
      { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
      { name: 'userDAO', type: 'foam.dao.DAO' },
      { name: 'x', type: 'Context' },
      { name: 'dao', type: 'foam.dao.DAO' }
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
      payee.setLifecycleState(LifecycleState.ACTIVE);
      payee = (User) userDAO.put_(x, payee);
      X payeeContext = Auth.sudo(x, payee);

      boolean threw = false;

      // Test create new invoice with put_ method as payee
      try {
        invoice = (Invoice) dao.put_(payeeContext, invoice);
      } catch(AuthorizationException t) {
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
        threw = true;
      }
      test( ! threw, "Payee (Business user) should be able to update an invoice they created." );

      // Test find_ method with payee
      threw = false;
      try {
        invoice = (Invoice) dao.find_(payeeContext, mutatedInvoice);
      } catch(AuthorizationException t) {
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
      test( threw && message.equals("Cannot update reference Id"), "Payee (Business user) should not be able to update reference Id on an invoice." );

      // Test select_ method with invoice payee business user
      threw = false;
      ArraySink tempSink = new ArraySink();
      try {
        tempSink = (ArraySink) dao.select_(x, tempSink, 0, 1000, null, null);
      } catch(AuthorizationException t) {
        threw = true;
      }
      test( ! threw && tempSink.getArray().size() > 0, "Invoice payee successfully selected invoice.");

      // Clean up
      dao.remove_(x, invoice);
    `
  },
  {
    name: 'AuthenticatedInvoice_Payer',
    args: [
      { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
      { name: 'userDAO', type: 'foam.dao.DAO' },
      { name: 'x', type: 'Context' },
      { name: 'dao', type: 'foam.dao.DAO' }
    ],
    javaCode: `
      // Test setup
      String message = "";
      User payer = new User();
      payer.setId(1380);
      payer.setFirstName("payer");
      payer.setLastName("Business");
      payer.setLifecycleState(LifecycleState.ACTIVE);
      payer.setEmail("test@mailinator.com");
      payer.setGroup("business");
      payer = (User) userDAO.put_(x, payer);
      X payerContext = Auth.sudo(x, payer);
      boolean threw = false;

      // Test create new invoice with put_ method as payer
      try {
        invoice = (Invoice) dao.put_(payerContext, invoice);
      } catch(AuthorizationException t) {
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
        threw = true;
      }
      test( ! threw, "Payer (Business user) should be able to update an invoice they created." );

      // Test find_ method with payer
      threw = false;
      try {
        invoice = (Invoice) dao.find_(payerContext, mutatedInvoice);
      } catch(AuthorizationException t) {
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
      test( threw && message.equals("Cannot update reference Id"), "Payer (Business user) should not be able to update reference Id on an invoice." );

      // Test select_ method with invoice payer business user
      threw = false;
      ArraySink tempSink = new ArraySink();
      try {
        tempSink = (ArraySink) dao.select_(x, tempSink, 0, 1000, null, null);
      } catch(AuthorizationException t) {
        threw = true;
      }
      test( ! threw && tempSink.getArray().size() > 0, "Invoice payer successfully selected invoice.");

      // Clean up
      dao.remove_(x, invoice);
    `
  },
  {
    name: 'AuthenticatedInvoice_BusinessUser',
    args: [
      { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
      { name: 'userDAO', type: 'foam.dao.DAO' },
      { name: 'x', type: 'Context' },
      { name: 'dao', type: 'foam.dao.DAO' }
    ],
    javaCode: `
      // Test setup
      String message = "";
      User businessUser = new User();
      businessUser.setId(1311);
      businessUser.setFirstName("Normal");
      businessUser.setLastName("Business");
      businessUser.setEmail("test@mailinator.com");
      businessUser.setGroup("business");
      businessUser.setLifecycleState(LifecycleState.ACTIVE);
      userDAO.put(businessUser);
      X businessUserContext = Auth.sudo(x, businessUser);

      boolean threw = false;

      // Test create invoice put_ method with business user
      try {
        invoice = (Invoice) dao.put_(businessUserContext, invoice);
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
      dao.remove_(x, invoice);
    `
  },
  {
    name: 'AuthenticatedInvoice_RemoveRelated',
    args: [
      { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
      { name: 'userDAO', type: 'foam.dao.DAO' },
      { name: 'x', type: 'Context' },
      { name: 'dao', type: 'foam.dao.DAO' },
      { name: 'transactionDAO', type: 'foam.dao.DAO' }
    ],
    javaCode: `
      // Test setup
      User relatedUser = new User();
      relatedUser.setId(1380);
      relatedUser.setFirstName("RelatedUser");
      relatedUser.setLastName("Account");
      relatedUser.setEmail("test.related@mailinator.com");
      relatedUser.setGroup("business");
      relatedUser.setLifecycleState(LifecycleState.ACTIVE);
      userDAO.put(relatedUser);
      X relatedUserContext = Auth.sudo(x, relatedUser);

      invoice.setCreatedBy((long)1380);
      invoice.setDraft(true);
      invoice = (Invoice) dao.put_(x, invoice);

      // Test remove of invoice as related user.
      boolean threw = false;
      Invoice inv = null;
      try {
        dao.remove_(relatedUserContext, invoice);
        inv = (Invoice) dao.find_(relatedUserContext, invoice);
      } catch(AuthorizationException t) {
        threw = true;
      }
      test( ! threw && inv == null, "Related user can remove invoice they created." );

      // Test remove_ of invoice with relation to a transaction as a related user.

      // Create transaction with related invoice. Invoice should not be deleted.
      Transaction transaction = new Transaction();
      transaction.setId("string-id");
      transaction.setInvoiceId(invoice.getId());
      transaction = (Transaction) transactionDAO.put_(x, transaction);

      invoice = (Invoice) invoice.fclone();
      dao.put_(relatedUserContext, invoice);

      threw = false;
      inv = null;
      try {
        dao.remove_(relatedUserContext, invoice);
        inv = (Invoice) dao.find_(x, invoice);
      } catch(AuthorizationException t) {
        threw = true;
      }
      test( ! threw && inv != null, "Related user can't remove invoice related to transaction, can't find but permitted admin can." );

      // Clean Up.
      transactionDAO.remove_(x, transaction);
      dao.remove_(x, invoice);
    `
  },
  {
    name: 'AuthenticatedInvoice_RemoveTransactionRelatedInvoice',
    args: [
      { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
      { name: 'userDAO', type: 'foam.dao.DAO' },
      { name: 'x', type: 'Context' },
      { name: 'dao', type: 'foam.dao.DAO' },
      { name: 'transactionDAO', type: 'foam.dao.DAO' }
    ],
    javaCode: `
      // Test setup
      String message = "";
      boolean threw = false;
      Invoice inv = null;
      invoice = (Invoice) dao.put_(x, invoice);
      invoice = (Invoice) invoice.fclone();

      // Create transaction with related invoice. Invoice should not be deleted.
      Transaction transaction = new Transaction();
      transaction.setId("string-id");
      transaction.setInvoiceId(invoice.getId());
      transaction = (Transaction) transactionDAO.put_(x, transaction);

      // Test find_ of deleted invoice as admin user.
      threw = false;
      try {
        dao.remove_(x, invoice);
        inv = (Invoice) dao.find_(x, invoice);
      } catch (Exception t) {
        threw = true;
      }
      test( ! threw && inv != null && inv.getLifecycleState() == LifecycleState.DELETED, "Admin user can find removed invoice." );

      // Test select_ of deleted invoice as admin user.
      threw = false;
      ArraySink result = new ArraySink();
      try {
        result = (ArraySink) dao.select_(x, new ArraySink(), 0, 1, null, null);
      } catch (Exception t) {
        threw = true;
      }
      test( ! threw && result.getArray().size() != 0, "Admin user can select deleted invoices." );

      User relatedUser = new User();
      relatedUser.setId(1380);
      relatedUser.setFirstName("RelatedUser");
      relatedUser.setLastName("Account");
      relatedUser.setEmail("test.related@mailinator.com");
      relatedUser.setGroup("business");
      relatedUser.setLifecycleState(LifecycleState.ACTIVE);
      userDAO.put(relatedUser);
      X relatedUserContext = Auth.sudo(x, relatedUser);

      // Test find_ of deleted invoice as related user.
      threw = false;
      inv = null;
      try {
        inv = (Invoice) dao.find_(relatedUserContext, invoice);
      } catch (Exception t) {
        threw = true;
      }
      test( ! threw && inv == null, "Related user can't find deleted invoice." );

      // Clean up
      transactionDAO.remove_(x, transaction);
    `
  },
  {
    name: 'AuthenticatedInvoice_RemoveUnrelated',
    args: [
      { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
      { name: 'userDAO', type: 'foam.dao.DAO' },
      { name: 'x', type: 'Context' },
      { name: 'dao', type: 'foam.dao.DAO' }
    ],
    javaCode: `
      // Test setup
      String message = "";
      User unrelatedUser = new User();
      unrelatedUser.setId(1000);
      unrelatedUser.setFirstName("UnrelatedUser");
      unrelatedUser.setLastName("Account");
      unrelatedUser.setEmail("test.unrelated@mailinator.com");
      unrelatedUser.setGroup("business");
      unrelatedUser.setLifecycleState(LifecycleState.ACTIVE);
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
       { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' },
       { name: 'userDAO', type: 'foam.dao.DAO' },
       { name: 'x', type: 'Context' },
       { name: 'dao', type: 'foam.dao.DAO' }
     ],
     javaCode: `
      // Test setup
      String message = "";
      User relatedUser = new User();
      relatedUser.setId(1380);
      relatedUser.setFirstName("RelatedUser");
      relatedUser.setLastName("Account");
      relatedUser.setEmail("test.related@mailinator.com");
      relatedUser.setGroup("business");
      relatedUser.setLifecycleState(LifecycleState.ACTIVE);
      userDAO.put(relatedUser);
      X relatedUserContext = Auth.sudo(x, relatedUser);

      // Set invoice to be draft and created by to related user.
      Invoice mutatedInvoice = (Invoice) invoice.fclone();
      mutatedInvoice.setDraft(true);
      mutatedInvoice.setCreatedBy(1380);
      mutatedInvoice = (Invoice) dao.put_(relatedUserContext, mutatedInvoice);

      boolean threw = false;
      // Test removing draft invoice as related user.
      try {
        dao.remove_(relatedUserContext, mutatedInvoice);
      } catch(AuthorizationException t) {
        threw = true;
      }
      test( ! threw, "Able to delete draft invoice." );

      // Clean up already performed if passed.
    `
  },
  {
    name: 'extendedAuthInvoice_DraftInvoice',
    args: [
      { name: 'x', type: 'Context' },
      { name: 'userDAO', type: 'foam.dao.DAO' },
      { name: 'invoiceDAO', type: 'foam.dao.DAO' },
      { name: 'invoice', type: 'net.nanopay.invoice.model.Invoice' }
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
      User admin = ((Subject) x.get("subject")).getUser();

      // Payer Business User
      User payerUser = new User();
      payerUser.setId(1380);
      payerUser.setFirstName("payerUser");
      payerUser.setLastName("payer");
      payerUser.setEmail("payer@mailinator.com");
      payerUser.setGroup("business");
      payerUser.setLifecycleState(LifecycleState.ACTIVE);

      // Regular business user
      User regUser = new User();
      regUser.setId(1369);
      regUser.setFirstName("RelatedUser");
      regUser.setLastName("Account");
      regUser.setEmail("test.related@mailinator.com");
      regUser.setLifecycleState(LifecycleState.ACTIVE);
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
      }
      test( result.getArray().size() != 0, "Test 5: Selecting regular user invoice as regular user" );

      // 6: regUserContext
      // Logic: adminPermInvoice was NOT created by regUser as a draft invoice, and should be NOT be found while running as regUser using .select
      try {
        result = (ArraySink) invoiceDAO.where(
        EQ(Invoice.ID, adminPermInvoice.getId())).select_(regUserContext, new ArraySink(), 0, 1, null, null);
      } catch (Exception e) {
      }
      test( result.getArray().size() == 0, "Test 6: Select adminPermInvoice with regUser" );

      // Clean up
      invoiceDAO.remove_(x, adminPermInvoice);
      invoiceDAO.remove_(x, regUserPermInvoice);
    `
  }
]
});
