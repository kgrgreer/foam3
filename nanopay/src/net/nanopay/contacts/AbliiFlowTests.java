package net.nanopay.contacts;

import java.util.List;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.nanos.logger.Logger;
import foam.nanos.test.Test;
import foam.util.Auth;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.cico.service.BankAccountVerifierService;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class AbliiFlowTests
extends Test
{

  protected DAO userDAO_;
  protected DAO accountDAO_;
  protected DAO contactDAO_;
  protected DAO invoiceDAO_;
  protected User mainUser_;
  protected X mainUserContext_;
  protected X x;

  public void cleanUserData() {
    userDAO_.where(foam.mlang.MLang.EQ(User.EMAIL, "bob@marley.com")).removeAll();
    userDAO_.where(foam.mlang.MLang.EQ(User.EMAIL, "oxy@moron.com")).removeAll();
    userDAO_.where(foam.mlang.MLang.EQ(User.EMAIL, "unicorn@princess.com")).removeAll();
    userDAO_.where(foam.mlang.MLang.EQ(User.EMAIL, "prince@caspen.com")).removeAll();
    userDAO_.where(foam.mlang.MLang.EQ(User.EMAIL, "fox@example.com")).removeAll();
    userDAO_.where(foam.mlang.MLang.EQ(User.EMAIL, "foo@bar.com")).removeAll();
    userDAO_.where(foam.mlang.MLang.EQ(User.EMAIL, "bar@foo.com")).removeAll();
  }

  public void cleanAccountData() {
    accountDAO_.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account")).removeAll();
    accountDAO_.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account1")).removeAll();
    accountDAO_.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account2")).removeAll();
    accountDAO_.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account3")).removeAll();
    accountDAO_.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account 4")).removeAll();
  }

  public void cleanContactData() {
    contactDAO_.where(foam.mlang.MLang.EQ(Contact.EMAIL, "fox@example.com")).removeAll();
  }

  public void cleanInvoiceData() {
    try {
      invoiceDAO_.removeAll();
    } catch ( IllegalStateException ise ) {
      // Exceptions may be thrown if contacs/users are deleted before invoices,
      // as Invoide deletion does invoke some of the invoice validation logic.
      Logger logger = (Logger) x.get("logger");
      logger.log(ise);
    }
  }

  public Account getMainUserBankAccount() {
    ArraySink mainUserAccountSink = (ArraySink) mainUser_.getAccounts(mainUserContext_)
      .where(MLang.INSTANCE_OF(CABankAccount.class))
      .select(new ArraySink());
    List mainUserAccounts = mainUserAccountSink.getArray();
    Account mainUserBankAccount = (Account) mainUserAccounts.get(0);

    return mainUserBankAccount;
  }

  // First the tests will show a flow where a User(payer) is paying an invoice to a User(payee) who does not have a BankAccount associated to them.
  // the flow is for an invoiceDAO decorator to set the destination Account of the invoice to the Digital Holding account (payers default digital Account)
  // status and balances are checked in the tests within. After the money is kept sent to the digital account, there is a test that confirms
  // that the money in the holding Account is reserved for the payee of the invoice.
  public void flow1() {
    // build test 1 User
    User testUser = new User();
    testUser.setGroup("smeBusinessAdmin");
    testUser.setFirstName("Prince");
    testUser.setLastName("Caspen");
    testUser.setEmail("prince@caspen.com");
    testUser.setEmailVerified(true);

    testUser = (User) userDAO_.put(testUser);

    Account mainUserBankAccount = getMainUserBankAccount();

    // Create a payable invoice with the testUser as the payee.
    Invoice payableInvoice = new Invoice();
    payableInvoice.setPayeeId(testUser.getId());
    payableInvoice.setPayerId(mainUser_.getId());
    payableInvoice.setAmount(1);
    payableInvoice.setSourceCurrency("CAD");
    payableInvoice.setDestinationCurrency("CAD");
    payableInvoice.setAccount(mainUserBankAccount.getId());

    payableInvoice = (Invoice) mainUser_.getExpenses(mainUserContext_).put(payableInvoice);
    Account mainUserDigitalHoldingAccount = (Account) accountDAO_.find(payableInvoice.getDestinationAccount());

    test( mainUserDigitalHoldingAccount instanceof DigitalAccount
      && mainUserDigitalHoldingAccount.getOwner() == mainUser_.getId(),
      "Flow 1: Given User1 (with a Bank account) and User2 (no Bank account) " +
        "When user1 creates an invoice payable to user2 " +
        "Then the created invoice should have the destination account set to user1's default digital account ");

    test( payableInvoice.getStatus() == InvoiceStatus.UNPAID,
      "Flow 1: Given User1 (with a Bank account) and User2 (no Bank account) " +
      "When user1 creates an invoice payable to user2 " +
      "Then the created invoice should have the status as 'Unpaid'");


    // balance before the invoice was paid
    long priorBalance = (Long) mainUserDigitalHoldingAccount.findBalance(x);

    // pay the invoice
    Transaction txn = new Transaction();
    txn.setPayerId(mainUser_.getId());
    txn.setPayeeId(testUser.getId());
    txn.setSourceAccount(payableInvoice.getAccount());
    txn.setDestinationAccount(payableInvoice.getDestinationAccount());
    txn.setInvoiceId(payableInvoice.getId());
    txn.setAmount(payableInvoice.getAmount());

    DAO mainUserTransactionDAO = ((DAO) mainUserContext_.get("transactionDAO")).inX(mainUserContext_);
    txn = (Transaction) mainUserTransactionDAO.put(txn);

    payableInvoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(payableInvoice.getId());

    test(payableInvoice.getStatus() == InvoiceStatus.PROCESSING,
      "Flow 1: Given an payable invoice from User1 (with a Bank account) and User2 (no Bank account) " +
        "When a transaction is made to from user1 to user2 to pay the invoice " +
        "Then the status of the invoice should be 'PENDING' ");

    // complete the transaction
    txn.setStatus(TransactionStatus.COMPLETED);
    txn = (Transaction) mainUserTransactionDAO.put(txn);

    payableInvoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(payableInvoice.getId());
    test(payableInvoice.getStatus().equals(InvoiceStatus.PENDING_ACCEPTANCE),
      "Flow 1: Given an payable invoice from User1 (with a Bank account) and User2 (no Bank account) " +
        "When a Transaction was made by user1 to user2 to pay the invoice and the transaction is completed " +
        "Then the status of the invoice should be 'PENDING_ACCEPTANCE'");

    long newBalance = (Long) mainUserDigitalHoldingAccount.findBalance(x);

    test((newBalance - priorBalance) == payableInvoice.getAmount(),
      "Flow 1: Given an payable invoice from User1 (with a Bank account) and User2 (no Bank account) " +
        "When a Transaction was made by user1 to user2 to pay the invoice and the transaction is completed " +
        "Then the new balance of user1's digital holding account should reflect that");

    // Mimic flow of depositing money that was sent to a User
    // User would see the invoice. If they click accept payment the below logic is executed
    // Difference is test1User.getId() would actually be user in current context and
    // account1 would be the chosen user account

    //  create new account for testUser
    CABankAccount testUserBankAccount = new CABankAccount();
    testUserBankAccount.setName("bank testUser account1");
    testUserBankAccount.setDenomination("CAD");
    testUserBankAccount.setAccountNumber("87654321");
    testUserBankAccount.setInstitution(1);
    testUserBankAccount.setBranchId("54321");
    testUserBankAccount.setStatus(BankAccountStatus.VERIFIED);

    X testUserContext = foam.util.Auth.sudo(x, testUser);
    DAO testUserTransactionDAO = ((DAO) testUserContext.get("transactionDAO")).inX(testUserContext);

    testUserBankAccount = (CABankAccount) testUser.getAccounts(testUserContext).put(testUserBankAccount);

    Invoice receivableInvoice  = (Invoice) testUser.getSales(testUserContext).find(payableInvoice.getId());

    // Receive funds - User accepts payment selecting new bank account as dst account.
    Transaction holdingToBankTxn = new Transaction();
    holdingToBankTxn.setSourceAccount(receivableInvoice.getDestinationAccount());
    holdingToBankTxn.setDestinationAccount(testUserBankAccount.getId());
    holdingToBankTxn.setInvoiceId(receivableInvoice.getId());
    holdingToBankTxn.setAmount(receivableInvoice.getAmount());

    holdingToBankTxn = (Transaction) testUserTransactionDAO.put(holdingToBankTxn); // transfer from holding to bank acc
    // get updated invoice
    receivableInvoice  = (Invoice) testUser.getSales(testUserContext).find(payableInvoice.getId());

    test(receivableInvoice.getStatus().equals(InvoiceStatus.DEPOSITING_MONEY)
        && holdingToBankTxn.getStatus().equals(TransactionStatus.PENDING),
      "Flow 1: Given user2 with an invoice with pending Acceptance status " +
        "When the user2 adds a new Bank Account and attempts to transfer from payer's holding account to the new Bank account " +
        "Then the transaction's status should be pending and Invoice's status should be DEPOSITING_MONEY");

    holdingToBankTxn.setStatus(TransactionStatus.SENT);
    holdingToBankTxn = (Transaction) testUserTransactionDAO.put(holdingToBankTxn);

    holdingToBankTxn.setStatus(TransactionStatus.COMPLETED);
    holdingToBankTxn = (Transaction) testUserTransactionDAO.put(holdingToBankTxn);

    // get updated invoice
    receivableInvoice  = (Invoice) testUser.getSales(testUserContext).find(payableInvoice.getId());
    long mainUserDigitalHoldingAccountBalance = (Long) mainUserDigitalHoldingAccount.findBalance(mainUserContext_);


    test(receivableInvoice.getStatus().equals(InvoiceStatus.PAID),
      "Flow 1: Given user2 and the invoice that deposited some amount in the user1's digital holding account " +
        "When the transaction to transfer the funds from user1's holding account to user2's BankAccount is completed " +
        "Then the Invoice's status should be 'Paid'");


    test(mainUserDigitalHoldingAccountBalance  == 0,
      "Flow 1: Given user1 and the invoice payable to user2 that deposited some amount in the user1's digital holding account " +
        "When the transaction to transfer the funds from user1's holding account to user2's BankAccount is completed " +
        "Then the user's holding account's balance should be 0 Balance");

  }

  // *flow 2*: Is to test the flow of Payer paying an invoice to Payee who is a Contact. A transaction is made to the payee,
  // and tested to see if the funds are stored correctly (holding account -payer's default digital account).
  // Then this test mimics the onboarding of payee-Contact to payee-User and
  // then process funds to the payee's bank.
  public void flow2() {
    Contact testContact = new Contact();
    testContact.setEmail("fox@example.com");
    testContact.setFirstName("Fox");
    testContact.setLastName("McCloud");
    testContact.setOrganization("Example Company");
    testContact.setGroup("sme");

    testContact = (Contact) mainUser_.getContacts(mainUserContext_).put(testContact);

    Account mainUserBankAccount = getMainUserBankAccount();

    // Create a payable invoice with the testContact as the payee.
    Invoice payableInvoice = new Invoice();
    payableInvoice.setPayeeId(testContact.getId());
    payableInvoice.setAmount(1);
    payableInvoice.setSourceCurrency("CAD");
    payableInvoice.setDestinationCurrency("CAD");
    payableInvoice.setAccount(mainUserBankAccount.getId());

    payableInvoice = (Invoice) mainUser_.getExpenses(mainUserContext_).put(payableInvoice);
    Account mainUserDigitalHoldingAccount = (Account) accountDAO_.find(payableInvoice.getDestinationAccount());

    test( mainUserDigitalHoldingAccount instanceof DigitalAccount
        && mainUserDigitalHoldingAccount.getOwner() == mainUser_.getId(),
      "Flow 2: Given User1 (with a Bank account) and Contact " +
        "When user1 creates an invoice payable to Contact " +
        "Then the created invoice should have the destination account set to user1's default digital holding account");

    test( payableInvoice.getStatus() == InvoiceStatus.UNPAID,
      "Flow 2: Given User1 (with a Bank account) and Contact " +
        "When user1 creates an invoice payable to Contact " +
        "Then the created invoice should have the status as Unpaid");

    // balance before the invoice was paid
    long priorBalance = (Long) mainUserDigitalHoldingAccount.findBalance(x);

    // pay the invoice
    Transaction txn = new Transaction();
    txn.setPayerId(mainUser_.getId());
    txn.setPayeeId(testContact.getId());
    txn.setSourceAccount(payableInvoice.getAccount());
    txn.setDestinationAccount(payableInvoice.getDestinationAccount());
    txn.setInvoiceId(payableInvoice.getId());
    txn.setAmount(payableInvoice.getAmount());

    DAO mainUserTransactionDAO = ((DAO) mainUserContext_.get("transactionDAO")).inX(mainUserContext_);
    txn = (Transaction) mainUserTransactionDAO.put(txn);

    payableInvoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(payableInvoice.getId());

    // Was status set correctly for an in progress Cashin from Bank to Digital.
    test(payableInvoice.getStatus() == InvoiceStatus.PROCESSING,
      "Flow 2: Given an payable invoice from User1 (with a Bank account) and Contact " +
        "When a transaction is made to from user1 to Contact to pay the invoice " +
        "Then the status of the invoice should be 'PENDING' " +
        "Expected Status: " + InvoiceStatus.PROCESSING.getLabel() +
        "Actual Status: " + payableInvoice.getStatus().getLabel());

    // complete the transaction
    txn.setStatus(TransactionStatus.COMPLETED);
    txn = (Transaction) mainUserTransactionDAO.put(txn);

    payableInvoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(payableInvoice.getId());
    test(payableInvoice.getStatus().equals(InvoiceStatus.PENDING_ACCEPTANCE),
      "Flow 2: Given an payable invoice from User1 (with a Bank account) and Contact " +
        "When a Transaction was made by user1 to Contact to pay the invoice and the transaction is completed " +
        "Then the status of the invoice should be 'PENDING_ACCEPTANCE' ");

    long newBalance = (Long) mainUserDigitalHoldingAccount.findBalance(x);

    test((newBalance - priorBalance) == payableInvoice.getAmount(),
      "Flow 2: Given an payable invoice from User1 (with a Bank account) and Contact " +
        "When a Transaction was made by user1 to Contact to pay the invoice and the transaction is completed " +
        "Then the new balance of user1's digital holding account should reflect that");

    // Mimic flow for Contact becoming User
    User contactUser = new User();
    contactUser.setGroup("smeBusinessAdmin");
    contactUser.setFirstName("Fox");
    contactUser.setLastName("MkCloud");
    contactUser.setEmail("fox@example.com");
    contactUser.setEmailVerified(true);
    contactUser = (User) userDAO_.put(contactUser);

    X contactUserContext = foam.util.Auth.sudo(x, contactUser);
    // Note: contactUser.getSales(contactUserContext).find(payableInvoice.getId()) = null,
    // because this test is not linking invoices of contacts to their equivalent user.
    // This feature is reserved for the onboarding of a contact.
    // Below a put into the invoiceDAO will mimic the onboarding of a Contact - a SMEInvoiceDAO decorator will set things right
    Invoice receivableInvoice =(Invoice) contactUser.getSales(contactUserContext).put(payableInvoice);

    test(receivableInvoice.getPayeeId() == contactUser.getId(),
      "Flow 2: Given a Contact, that contact's onboarded user and an invoice payable to the contact " +
        "When the original payable is put to the contactUser's receivables " +
        "Then the payeeId of the invoice should be updated from the contact's id to the testContact's id");


    //  create new account for contactUser
    CABankAccount contactUserBankAccount = new CABankAccount();
    contactUserBankAccount.setName("bank contactUser account1");
    contactUserBankAccount.setDenomination("CAD");
    contactUserBankAccount.setAccountNumber("87654321");
    contactUserBankAccount.setInstitution(1);
    contactUserBankAccount.setBranchId("54321");
    contactUserBankAccount.setStatus(BankAccountStatus.VERIFIED);

    contactUserBankAccount = (CABankAccount) contactUser.getAccounts(contactUserContext).put(contactUserBankAccount);

    // Receive funds - contactUser accepts payment selecting new bank account as dst account.
    Transaction holdingToBankTxn = new Transaction();
    holdingToBankTxn.setSourceAccount(receivableInvoice.getDestinationAccount());
    holdingToBankTxn.setDestinationAccount(contactUserBankAccount.getId());
    holdingToBankTxn.setInvoiceId(receivableInvoice.getId());
    holdingToBankTxn.setAmount(receivableInvoice.getAmount());


    DAO contactUserTransactionDAO = ((DAO) contactUserContext.get("transactionDAO")).inX(contactUserContext);
    holdingToBankTxn = (Transaction) contactUserTransactionDAO.put(holdingToBankTxn); // transfer from holding to bank acc
    // get updated invoice
    receivableInvoice  = (Invoice) contactUser.getSales(contactUserContext).find(payableInvoice.getId());

    test(receivableInvoice.getStatus().equals(InvoiceStatus.DEPOSITING_MONEY)
        && holdingToBankTxn.getStatus().equals(TransactionStatus.PENDING),
      "Flow 2: Given contactUser with an invoice with pending Acceptance status " +
        "When the contactUser adds a new Bank Account and attempts to transfer from payer's holding account to the new Bank account " +
        "Then the transaction's status should be pending and Invoice's status should be DEPOSITING_MONEY");

    // sent status creates transfers for CO Txns
    holdingToBankTxn.setStatus(TransactionStatus.SENT);
    holdingToBankTxn = (Transaction) contactUserTransactionDAO.put(holdingToBankTxn);

    holdingToBankTxn.setStatus(TransactionStatus.COMPLETED);
    holdingToBankTxn = (Transaction) contactUserTransactionDAO.put(holdingToBankTxn);

    // get updated invoice
    receivableInvoice  = (Invoice) contactUser.getSales(contactUserContext).find(payableInvoice.getId());
    long mainUserDigitalHoldingAccountBalance = (Long) mainUserDigitalHoldingAccount.findBalance(mainUserContext_);


    test(receivableInvoice.getStatus().equals(InvoiceStatus.PAID),
      "Flow 2: Given contactUser and the invoice that deposited some amount in the user1's digital holding account " +
        "When the transaction to transfer the funds from user1's holding account to user2's contactUser is completed " +
        "Then the Invoice's status should be 'Paid'");


    test(mainUserDigitalHoldingAccountBalance  == 0,
      "Flow 2: Given user1 and the invoice payable to contact that deposited some amount in the user1's digital holding account " +
        "When the transaction to transfer the funds from user1's holding account to contactUser's BankAccount is completed " +
        "Then the user's holding account's balance should be 0 Balance" );
  }

  // *flow 3* This flow is to test that a non-ablii/sme User(s) do not go through the same flow as described and tested above in flow 1 and flow 2.
  public void flow3() {
    User testUser1 = new User();
    testUser1.setFirstName("Fo");
    testUser1.setLastName("Bar");
    testUser1.setEmail("foo@bar.com");
    testUser1.setEmailVerified(true);

    User testUser2 = new User();
    testUser2.setFirstName("BAR");
    testUser2.setLastName("Foo");
    testUser2.setEmail("bar@foo.com");
    testUser2.setEmailVerified(true);

    testUser1 = (User) userDAO_.put(testUser1);
    testUser2 = (User) userDAO_.put(testUser2);

    BankAccount testUser1Account = new CABankAccount();
    testUser1Account.setName("bank testUser1 account");
    testUser1Account.setDenomination("CAD");
    testUser1Account.setAccountNumber("87654300");
    testUser1Account.setInstitution(1);
    testUser1Account.setBranchId("54300");
    testUser1Account.setStatus(BankAccountStatus.VERIFIED);

    X testUser1Context = Auth.sudo(x, testUser1);
    testUser1Account = (BankAccount) testUser1.getAccounts(testUser1Context).put(testUser1Account);

    Invoice invoice = new Invoice();
    invoice.setPayeeId(testUser2.getId());
    invoice.setAmount(1);
    invoice.setDestinationCurrency("CAD");
    invoice.setAccount(testUser1Account.getId());

    invoice = (Invoice) testUser1.getExpenses(testUser1Context).put(invoice);

    DAO testUser1TransactionDAO = ((DAO) testUser1Context.get("transactionDAO")).inX(testUser1Context);

    // Basic Trans
    Transaction txn = new Transaction();
    txn.setSourceAccount(testUser1Account.getId());
    txn.setInvoiceId(invoice.getId());
    txn.setAmount(1);
    txn = (Transaction) testUser1TransactionDAO.put(txn);

    test(invoice.getStatus() != InvoiceStatus.PENDING_ACCEPTANCE,
      "Flow 3: Given the user1 (non-ablii) and user2 (non-ablii) and the invoice payable to user1 to user2 " +
        "When the transaction is made to pay the invoice from user1  " +
        "Then the invoice Status should not be PENDING_ACCEPTANCE " + invoice.getStatus().getLabel());
  }

  // *flow 4* We have tests that are to mimic the situation where a User(payer) begins to process a payment to a User with no bank account (payee)
  // and then before the transaction has completed to the holding account where the invoiceStatus would become Pending_Acceptance, the Payee onboards
  // and adds a bank account.
  public void flow4() {
    User testUser1 = new User();
    testUser1.setGroup("smeBusinessAdmin");
    testUser1.setFirstName("Warrior");
    testUser1.setLastName("Wizard");
    testUser1.setEmail("oxy@moron.com");
    testUser1.setEmailVerified(true);

    testUser1 = (User) userDAO_.put(testUser1);
    X testUser1Context = foam.util.Auth.sudo(x, testUser1);
    DAO testUser1TransactionDAO = ((DAO)testUser1Context.get("transactionDAO")).inX(testUser1Context);

    Account mainUsersAccount = getMainUserBankAccount();

    // Create a payable invoice with the testUser1 as the payee.
    Invoice invoice = new Invoice();
    invoice.setPayeeId(testUser1.getId());
    invoice.setAmount(1);
    invoice.setSourceCurrency("CAD");
    invoice.setDestinationCurrency("CAD");
    invoice.setAccount(mainUsersAccount.getId());
    invoice = (Invoice) mainUser_.getExpenses(mainUserContext_).put(invoice);

    Account mainUserDigitalHoldingAccount = (Account) accountDAO_.find(invoice.getDestinationAccount());
    test(mainUserDigitalHoldingAccount instanceof DigitalAccount
        && mainUserDigitalHoldingAccount.getOwner() == mainUser_.getId(),
      "Flow 4: Given User1 (with a Bank account) and User2 (no Bank account) " +
        "When user1 creates an invoice payable to user2 " +
        "Then the created invoice should have the destination account set to user1's default digital account");

    // pay the invoice
    Transaction txn = new Transaction();
    txn.setPayerId(mainUser_.getId());
    txn.setPayeeId(testUser1.getId());
    txn.setSourceAccount(invoice.getAccount());
    txn.setDestinationAccount(invoice.getDestinationAccount());
    txn.setInvoiceId(invoice.getId());
      txn.setAmount(invoice.getAmount());

    DAO mainUserTransactionDAO = ((DAO) mainUserContext_.get("transactionDAO")).inX(mainUserContext_);
    txn = (Transaction) mainUserTransactionDAO.put(txn);

    invoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(invoice.getId());

    // Was status set correctly for an in progress Cashin from Bank to Digital.
    test(invoice.getStatus() == InvoiceStatus.PROCESSING,
      "Flow 4: Given an payable invoice from User1 (with a Bank account) and User2 (no Bank account) " +
        "When a transaction is made to from user1 to user2 to pay the invoice " +
        "Then the status of the invoice should be 'PENDING' ");

    // prior completion of the Cashin to the holding account( payer's default digital account) the User adds a verified bank account

    // bank account for testUser1
    BankAccount account = new CABankAccount();
    account.setName("bank test account 4");
    account.setDenomination("CAD");
    account.setAccountNumber("12345678");
    account.setInstitution(1);
    account.setBranchId("12345");
    account.setIsDefault(true);
    account.setStatus(BankAccountStatus.VERIFIED);

    account = (BankAccount) testUser1.getAccounts(testUser1Context).put(account);

    // set the Transaction to completed to sim that CI happened
    txn.setStatus(TransactionStatus.COMPLETED);
    txn = (Transaction) mainUserTransactionDAO.put(txn);

    invoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(invoice);

    test(invoice.getStatus().equals(InvoiceStatus.DEPOSITING_MONEY),
      "Flow 4: Given user1 (with Bank Account) and user2 (with no Bank account) and payable invoice from user1 to user2 with status pending(processing) " +
        "When a the user 2 creates a valid verified bank account " +
        "Then this should init Auto deposit to the newly create bank account and the invoice status should be DEPOSITING_MONEY");
  }

  // flow 5. Flow 4 tests the edge case where User adds a bank account but its not verified the auto deposit should not init.
  // auto deposit should init when the bank account is verified
  public void flow5() {
    User testUser = new User();
    testUser.setGroup("smeBusinessAdmin");
    testUser.setFirstName("War");
    testUser.setLastName("Zone");
    testUser.setEmail("bob@marley.com");
    testUser.setEmailVerified(true);

    testUser = (User) userDAO_.put(testUser);
    X testUserContext = foam.util.Auth.sudo(x, testUser);
    DAO testUserTransactionDAO = ((DAO) testUserContext.get("transactionDAO")).inX(testUserContext);

    Account mainUsersAccount = getMainUserBankAccount();
    Invoice invoice = new Invoice();
    invoice.setPayeeId(testUser.getId());
    invoice.setAmount(1);
    invoice.setSourceCurrency("CAD");
    invoice.setDestinationCurrency("CAD");
    invoice.setAccount(mainUsersAccount.getId());
    invoice = (Invoice) mainUser_.getExpenses(mainUserContext_).put(invoice);

    // Pay the invoice.
    Transaction txn = new Transaction();
    txn.setPayerId(mainUser_.getId());
    txn.setPayeeId(testUser.getId());
    txn.setDestinationAccount(invoice.getDestinationAccount());
    txn.setInvoiceId(invoice.getId());
    txn.setAmount(invoice.getAmount());
    txn.setPayerId(mainUser_.getId());
    txn.setSourceAccount(invoice.getAccount());

    DAO mainUserTransactionDAO = ((DAO) mainUserContext_.get("transactionDAO")).inX(mainUserContext_);
    txn = (Transaction) mainUserTransactionDAO.put(txn);

    // bank account for test7User
    BankAccount testUserAccount = new CABankAccount();
    testUserAccount.setName("bank test account 5");
    testUserAccount.setDenomination("CAD");
    testUserAccount.setAccountNumber("12345688");
    testUserAccount.setInstitution(1);
    testUserAccount.setBranchId("12545");
    testUserAccount.setIsDefault(true);

    testUserAccount = (BankAccount) testUser.getAccounts(testUserContext).put(testUserAccount);

    txn.setStatus(TransactionStatus.COMPLETED);
    txn = (Transaction) mainUserTransactionDAO.put(txn);


    invoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(invoice);

    test(invoice.getStatus().equals(InvoiceStatus.PENDING_ACCEPTANCE),
      "Flow 5: Given an payable invoice from User1 (with a Bank account) and user2 (Bank account not verified) " +
        "When a Transaction was made by user1 to user2 to pay the invoice and the transaction is completed " +
        "Then the status of the invoice should be 'PENDING_ACCEPTANCE' ");


    BankAccountVerifierService bankAccountVerifierService = (BankAccountVerifierService) testUserContext.get("bankAccountVerification");
    bankAccountVerifierService.verify(testUserContext, testUserAccount.getId(), -1000000 );

    invoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(invoice);

    test(invoice.getStatus().equals(InvoiceStatus.DEPOSITING_MONEY),
      "Flow 5: Given user1 (with Bank Account) and user2 (Bank account not verified) and payable invoice from user1 to user2 with status pending Acceptance " +
        "When a the user 2 verifies the bank account " +
        "Then this should init Auto deposit to the newly verified bank account and the invoice status should be DEPOSITING_MONEY");
  }

  public void runTest(X globalX) {
    x = globalX;
    userDAO_ = (DAO) x.get("localUserDAO");
    accountDAO_ = (DAO) x.get("accountDAO");
    contactDAO_ = (DAO) x.get("contactDAO");
    invoiceDAO_ = (DAO) x.get("invoiceDAO");
    /* Confirm Clean UP */
    cleanUserData();
    cleanAccountData();
    cleanContactData();
    cleanInvoiceData();

    /* Main User */
    mainUser_ = new User();
    mainUser_.setGroup("smeBusinessAdmin");
    mainUser_.setFirstName("Unicorn");
    mainUser_.setLastName("Princess");
    mainUser_.setEmail("unicorn@princess.com");
    mainUser_.setEmailVerified(true);
    mainUser_ = (User) userDAO_.put(mainUser_);

    mainUserContext_ = foam.util.Auth.sudo(x, mainUser_);

    // bank account for smeUser
    CABankAccount account = new CABankAccount();
    account.setName("bank MainUser account");
    account.setDenomination("CAD");
    account.setAccountNumber("12345678");
    account.setInstitution(1);
    account.setBranchId("12345");
    account.setStatus(BankAccountStatus.VERIFIED);

    account = (CABankAccount) mainUser_.getAccounts(mainUserContext_).put(account);

    flow1();
    flow2();
    flow3();
    flow4();
    flow5();

    /* Confirm Clean UP */
    cleanUserData();
    cleanAccountData();
    cleanContactData();
    cleanInvoiceData();
  }
}
