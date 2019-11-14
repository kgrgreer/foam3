foam.CLASS({
  package: 'net.nanopay.account',
  name: 'AuthenticatedAccountDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.EmptyX',
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.MDAO',
    'foam.dao.Sink',
    'foam.nanos.auth.*',
    'foam.util.Auth',
    'java.lang.Object',
    'java.util.List',
    'net.nanopay.account.DigitalAccount'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
      DAO accountDAO = (DAO) x.get("accountDAO");
      DAO userDAO = (DAO) x.get("localUserDAO");

      // create new user1 user and context with them logged in
      User user1 = new User();
      user1.setId(1300);
      user1.setFirstName("Ranier Maria");
      user1.setLastName("Rilke");
      user1.setEmail("ranier@mailinator.com");
      user1.setGroup("basicUser");
      userDAO.put(user1);
      X user1Context = Auth.sudo(x, user1);

      User user2 = new User();
      user2.setId(1380);
      user2.setFirstName("Franz");
      user2.setLastName("Kappus");
      user2.setEmail("franzkappus@mailinator.com");
      user2.setGroup("basicUser");
      userDAO.put(user2);
      X user2Context = Auth.sudo(x, user2);

      // run tests
      test(AuthenticatedAccountDAO_CreateAccountWithNullUser(x,accountDAO), "Put to the DAO without a user logged in fails");
      test(AuthenticatedAccountDAO_UpdateUnownedAccount(user1, user1Context, user2Context, accountDAO) , "Trying to update an unowned account throws an Exception");
      test(AuthenticatedAccountDAO_UpdateOwnedAccount(user1, user1Context, accountDAO), "A user can update an owned account");
      test(AuthenticatedAccountDAO_CreateAccountForOtherUser(user1, user2Context, accountDAO), "Trying to create an account with another user as owner throws an Exception");
      test(AuthenticatedAccountDAO_SelectOnTheDAO(user1, user2, user1Context, user2Context, accountDAO), "A select on the DAO only returns owned accounts");
      test(AuthenticatedAccountDAO_DeleteUnownedAccount(user1, user1Context, user2Context, accountDAO), "Cannot delete unowned bank account");

      AuthenticatedAccountDAO_RunFindTests(user1, user1Context, user2, user2Context, accountDAO);
      AuthenticatedAccountDAO_SummarilyDeleteAccounts(user1, user2, user1Context, user2Context, accountDAO);

      // cleanup
      userDAO.remove(user1);
      userDAO.remove(user2);
    `
    },
    {
      name: 'AuthenticatedAccountDAO_CreateAccountWithNullUser',
      type: 'boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'accountDAO', type: 'foam.dao.DAO' },
      ],
      javaCode: `
      try {
        X nullUserContext = x.put("user", null);
        DigitalAccount account = new DigitalAccount();
        try {
          accountDAO.put_(nullUserContext, account);
        } catch ( Exception e ) {
          return true;
        }
        return false;
      } catch (Throwable t) {
        t.printStackTrace();
        return false;
      }
      `
    },
    {
      name: 'AuthenticatedAccountDAO_UpdateUnownedAccount',
      type: 'boolean',
      args: [
        { name: 'user1', type: 'foam.nanos.auth.User' },
        { name: 'user1Context', type: 'Context' },
        { name: 'user2Context', type: 'Context' },
        { name: 'accountDAO', type: 'foam.dao.DAO' },
      ],
      javaCode: `
  //  create an account with owner as one user, try to modify it as another
  DigitalAccount clonedAccount = null;
  try {
    DigitalAccount account = new DigitalAccount();
    account.setOwner(user1.getId());
    FObject putAccount = accountDAO.put_(user1Context, account);
    clonedAccount = (DigitalAccount) putAccount.fclone();
    clonedAccount.setDenomination("USD");
    try {
      accountDAO.put_(user2Context, clonedAccount);
    } catch ( Exception e ) {
      return true;
    }
    return false;
  } catch ( Throwable t ) {
    t.printStackTrace();
    return false;
  } finally {
    if ( clonedAccount != null ) accountDAO.remove_(user1Context, clonedAccount);
  }
      `
    },
    {
      name: 'AuthenticatedAccountDAO_RunFindTests',
      args: [
        { name: 'user1', type: 'foam.nanos.auth.User' },
        { name: 'user1Context', type: 'Context' },
        { name: 'user2', type: 'foam.nanos.auth.User' },
        { name: 'user2Context', type: 'Context' },
        { name: 'accountDAO', type: 'foam.dao.DAO' },
      ],
      javaCode: `
      //  Create an account
      FObject putAccount = null;
      try {
        // Create a new account as user 1.
        DigitalAccount account1 = new DigitalAccount();
        account1.setOwner(user1.getId());
        account1 = (DigitalAccount) accountDAO.put_(user1Context, account1);

        // Create a new account as user 2.
        DigitalAccount account2 = new DigitalAccount();
        account2.setOwner(user2.getId());
        account2 = (DigitalAccount) accountDAO.put_(user2Context, account2);

        // Find own account as user 1.
        test(accountDAO.find_(user1Context, account1.getId()) != null, "A user can find an account that they own.");

        // Try to find user 2's account as user 1.
        test(accountDAO.inX(user1Context).find(account2.getId()) == null, "A user cannot find an account that they do not own.");
      } catch (Throwable t) {
        test(false, "Tests for 'find' failed due to an unexpected exception.");
        t.printStackTrace();
      } finally {
        accountDAO.removeAll();
      }
      `
    },
    {
      name: 'AuthenticatedAccountDAO_UpdateOwnedAccount',
      type: 'boolean',
      args: [
        { name: 'user1', type: 'foam.nanos.auth.User' },
        { name: 'user1Context', type: 'Context' },
        { name: 'accountDAO', type: 'foam.dao.DAO' },
      ],
      javaCode: `
      // Create an account, with the denomination set to CAD
      DigitalAccount clonedAccount = null;
      try {
        DigitalAccount account = new DigitalAccount();
        account.setDenomination("CAD");
        account.setOwner(user1.getId());
        FObject putAccount = accountDAO.put_(user1Context, account);

        // Update the account to be USD denominated, assert that the account is now USD
        clonedAccount = (DigitalAccount) putAccount.fclone();
        clonedAccount.setDenomination("USD");
        accountDAO.put_(user1Context, clonedAccount);
        FObject updatedPutAccount = accountDAO.find_(user1Context, putAccount.getProperty("id"));
        return updatedPutAccount.getProperty("denomination").equals("USD");
      } catch (Throwable t) {
        t.printStackTrace();
        return false;
      } finally {
        if (clonedAccount != null) accountDAO.remove_(user1Context, clonedAccount);
      }
      `
    },
    {
      name: 'AuthenticatedAccountDAO_CreateAccountForOtherUser',
      type: 'boolean',
      args: [
        { name: 'user1', type: 'foam.nanos.auth.User' },
        { name: 'user2Context', type: 'Context' },
        { name: 'accountDAO', type: 'foam.dao.DAO' },
      ],
      javaCode: `
      //  create an account with owner as user1, try to put in DAO as user2
      try {
        DigitalAccount account = new DigitalAccount();
        account.setOwner(user1.getId());
        try {
          accountDAO.put_(user2Context, account);
        } catch (Exception e) {
          return true;
        }
        return false;
      } catch (Throwable t) {
        t.printStackTrace();
        return false;
      }
      `
    },
    {
      name: 'AuthenticatedAccountDAO_SelectOnTheDAO',
      type: 'boolean',
      args: [
        { name: 'user1', type: 'foam.nanos.auth.User' },
        { name: 'user2', type: 'foam.nanos.auth.User' },
        { name: 'user1Context', type: 'Context' },
        { name: 'user2Context', type: 'Context' },
        { name: 'accountDAO', type: 'foam.dao.DAO' },
      ],
      javaCode: `
      // create an accounts for different users, verify that a select returns only owned accounts
    
      // create accounts
      DigitalAccount account1 = null;
      DigitalAccount account2 = null;
      try {
        account1 = new DigitalAccount();
        account1.setOwner(user1.getId());
        accountDAO.put_(user1Context, account1);
        account2 = new DigitalAccount();
        account2.setOwner(user2.getId());
        accountDAO.put_(user2Context, account2);

        // select accounts
        Sink sink =  accountDAO.select_(user1Context, new ArraySink(), 0, 1000, null, null);
        List results = ((ArraySink) sink).getArray();

        // check that all returned accounts are owned by requestingUser
        for ( Object result : results ) {
          DigitalAccount account = (DigitalAccount) result;
          if ( account.getOwner() != user1.getId() ) {
            return false;
          }
        }
        return true;
      } catch (Throwable t) {
        t.printStackTrace();
        return false;
      } finally {
        if (account1 != null) accountDAO.remove_(user1Context, account1);
        if (account2 != null) accountDAO.remove_(user2Context, account2);
      }
      `
    },
    {
      name: 'AuthenticatedAccountDAO_DeleteUnownedAccount',
      type: 'boolean',
      args: [
        { name: 'user1', type: 'foam.nanos.auth.User' },
        { name: 'user1Context', type: 'Context' },
        { name: 'user2Context', type: 'Context' },
        { name: 'accountDAO', type: 'foam.dao.DAO' },
      ],
      javaCode: `
      //  create an account each for user1 and try to delete from user2 context
      DigitalAccount account = null;
      try {
        account = new DigitalAccount();
        account.setOwner(user1.getId());
        FObject putAccount = accountDAO.put_(user1Context, account);
        try {
          accountDAO.remove_(user2Context, putAccount);
        } catch (Exception e) {
          return true;
        }
        return false;
      } catch (Throwable t) {
        t.printStackTrace();
        return false;
      } finally {
        if (account != null) accountDAO.remove_(user1Context, account);
      }
      `
    },
    {
      name: 'AuthenticatedAccountDAO_SummarilyDeleteAccounts',
      args: [
        { name: 'user1', type: 'foam.nanos.auth.User' },
        { name: 'user2', type: 'foam.nanos.auth.User' },
        { name: 'user1Context', type: 'Context' },
        { name: 'user2Context', type: 'Context' },
        { name: 'accountDAO', type: 'foam.dao.DAO' },
      ],
      javaCode: `
      // Verify that removeAll only deletes accounts owned by the user doing the removeAll.
      try {
        // Create an account as user 1.
        DigitalAccount account1 = new DigitalAccount();
        account1.setOwner(user1.getId());
        account1 = (DigitalAccount) accountDAO.put_(user1Context, account1);

        // Create an account as user 2.
        DigitalAccount account2 = new DigitalAccount();
        account2.setOwner(user2.getId());
        account2 = (DigitalAccount) accountDAO.put_(user2Context, account2);

        // Call removeAll as user 2.
        accountDAO.removeAll_(user2Context, 0, 1000, null, null);

        // Check that user 2's account was deleted.
        test(accountDAO.find_(user2Context, account2.getId()) == null, "When a user calls 'removeAll', their accounts are deleted.");

        // Check that user 1's account was not deleted.
        test(accountDAO.find_(user1Context, account1.getId()) != null, "When a user calls 'removeAll', accounts owned by other users are not deleted.");
      } catch (Throwable t) {
        test(false, "The 'removeAll' tests failed due to an unexpected exception.");
        t.printStackTrace();
      }
      `
    }
  ]
});
