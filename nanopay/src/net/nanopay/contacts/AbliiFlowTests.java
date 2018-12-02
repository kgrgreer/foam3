package net.nanopay.contacts;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.auth.email.EmailWhitelistEntry;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.invoice.model.Invoice;
import net.nanopay.invoice.model.InvoiceStatus;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import java.util.List;

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

  public void whiteListTestEmail() {
    /* Whitelist the testing emails, then get rid of them at the end of the test. */
    DAO whitelistedEmailDAO = (DAO) x.get("whitelistedEmailDAO");
    whitelistedEmailDAO.put(new EmailWhitelistEntry.Builder(x).setId("bob@marley.com").build());
    whitelistedEmailDAO.put(new EmailWhitelistEntry.Builder(x).setId("oxy@moron.com").build());
    whitelistedEmailDAO.put(new EmailWhitelistEntry.Builder(x).setId("unicorn@princess.com").build());
    whitelistedEmailDAO.put(new EmailWhitelistEntry.Builder(x).setId("prince@caspen.com").build());
    whitelistedEmailDAO.put(new EmailWhitelistEntry.Builder(x).setId("fox@example.com").build());
    whitelistedEmailDAO.put(new EmailWhitelistEntry.Builder(x).setId("foo@bar.com").build());
    whitelistedEmailDAO.put(new EmailWhitelistEntry.Builder(x).setId("bar@foo.com").build());

  }

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
    invoiceDAO_.removeAll();
  }

  public User createTestUser() {
    // Test User 1
    User testUser = new User();
    testUser.setGroup("smeBusinessAdmin");
    testUser.setFirstName("Prince");
    testUser.setLastName("Caspen");
    testUser.setEmail("prince@caspen.com");
    testUser.setEmailVerified(true);

    testUser = (User) userDAO_.put(testUser);
//    X test1UserContext = foam.util.Auth.sudo(x, testUser);
//    transactionDAO1 = test1UserContext.get("transactionDAO").inX(test1UserContext);
    return testUser;
  }
  // First the tests will show a flow where a User(payer) is paying an invoice to a User(payee) who does not have a BankAccount associated to them.
  // the flow is for an invoiceDAO decorator to set the destination Account of the invoice to the Digital Holding account (payers default digital Account)
  // status and balances are checked in the tests within. After the money is kept sent to the digital account, there is a test that confirms
  // that the money in the holding Account is reserved for the payee of the invoice.
  public void flow1() {
    // build test 1 User
    User testUser = createTestUser();

    ArraySink mainUserAccountSink = (ArraySink) mainUser_.getAccounts(mainUserContext_)
      .where(MLang.INSTANCE_OF(CABankAccount.class))
      .select(new ArraySink());
    List mainUserAccounts = mainUserAccountSink.getArray();
    Account mainUserBankAccount = (Account) mainUserAccounts.get(0);

    // Create a payable invoice with the testUser as the payee.
    // operate
    Invoice payableInvoice = new Invoice();
    payableInvoice.setPayeeId(testUser.getId());
    payableInvoice.setPayerId(mainUser_.getId());
    payableInvoice.setAmount(1);
    payableInvoice.setSourceCurrency("CAD");
    payableInvoice.setDestinationCurrency("CAD");
    payableInvoice.setAccount(mainUserBankAccount.getId());

    payableInvoice = (Invoice) mainUser_.getExpenses(mainUserContext_).put(payableInvoice);
    Account testUserDigitalAccount = (Account) accountDAO_.find(payableInvoice.getDestinationAccount());

    // check
    test( testUserDigitalAccount instanceof DigitalAccount
      && testUserDigitalAccount.getOwner() == mainUser_.getId(),
      "Flow 1: Given User1 (with a Bank account) and User2 (no Bank account) " +
        "When user1 create an invoice to user2" +
        "Then the created invoice should have the destination account set to user2 default digital account");

    test( payableInvoice.getStatus() == InvoiceStatus.UNPAID,
      "Flow 1: Given User1 (with a Bank account) and User2 (no Bank account) " +
      "When user1 create an invoice to user2" +
      "Then the created invoice should have the status as Unpaid");

    // balance before the invoice was paid
    long priorBalance = (Long) testUserDigitalAccount.findBalance(x);

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

    // Was status set correctly for an in progress Cashin from Bank to Digital.
    test(payableInvoice.getStatus() == InvoiceStatus.IN_TRANSIT,
      "Flow 1: Given an payable invoice from User1 (with a Bank account) and User2 (no Bank account) " +
        "When a transaction is made to from user1 to user2 to pay the invoice" +
        "Then the status of the invoice should be 'IN_TRANSIT'");

    // complete the transaction
    txn.setStatus(TransactionStatus.COMPLETED);
    txn = (Transaction) mainUserTransactionDAO.put(txn);

    // TEST 3: Is the status set correctly for a completed payment/transaction to Digital holding account? and does the account balance reflect the proper balance after a transaction
    payableInvoice = (Invoice) mainUser_.getExpenses(mainUserContext_).find(payableInvoice.getId());
    test(payableInvoice.getStatus().equals(InvoiceStatus.PENDING_ACCEPTANCE),
      "Flow 1: Given an payable invoice from User1 (with a Bank account) and User2 (no Bank account) " +
        "When a Transaction was made by user1 to user2 to pay the invoice and the transaction is completed " +
        "Then the status of the invoice should be 'PENDING_ACCEPTANCE'");

    long newBalance = (Long) testUserDigitalAccount.findBalance(x);

    test((newBalance - priorBalance) == payableInvoice.getAmount(),
      "Flow 1: Given an payable invoice from User1 (with a Bank account) and User2 (no Bank account) " +
        "When a Transaction was made by user1 to user2 to pay the invoice and the transaction is completed " +
        "Then the new balance of user2's digital account should reflect that");

    // Testing whether we can withdraw money from Payer's DigitalAccount, arbitrarily.
    Transaction testTransactionDigital = new Transaction();
    testTransactionDigital.setAmount(payableInvoice.getAmount());
    testTransactionDigital.setPayeeId(mainUser_.getId());
    testTransactionDigital.setPayerId(testUser.getId());
    testTransactionDigital.setDestinationAccount(mainUserBankAccount.getId());
    testTransactionDigital.setSourceAccount(testUserDigitalAccount.getId());

    X testUserContext = foam.util.Auth.sudo(x, testUser);
    DAO testUserTransactionDAO = ((DAO) testUserContext.get("transactionDAO")).inX(testUserContext);

    // Can not withdraw money from Payer's DigitalAccount when a portion of balance is reserved in holding.
    test(
      TestUtils.testThrows(
        () -> testUserTransactionDAO.put(testTransactionDigital),
        "Insufficient balance",
        RuntimeException.class
      ),
      "Flow 1: Given user2 that has funds in the default digital holding Account " +
        "When the user2 attempts to transfer some funds to another user " +
        "Then this should throw an exception"
    );

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
      "Flow 1: Given user2 with balance in their holding digital account received from an invoice " +
        "When the user2 adds a new Bank Account and attempts to transfer from the holding account to Bank na account " +
        "Then the transaction's status should be pending and Invoice's status should be DEPOSITING_MONEY");

    holdingToBankTxn.setStatus(TransactionStatus.SENT);
    holdingToBankTxn = (Transaction) testUserTransactionDAO.put(holdingToBankTxn);

    holdingToBankTxn.setStatus(TransactionStatus.COMPLETED);
    holdingToBankTxn = (Transaction) testUserTransactionDAO.put(holdingToBankTxn);

    // get updated invoice
    receivableInvoice  = (Invoice) testUser.getSales(testUserContext).find(payableInvoice.getId());
    long testUserDigitalBalance = (Long) testUserDigitalAccount.findBalance(testUserContext);


    test(receivableInvoice.getStatus().equals(InvoiceStatus.PAID),
      "Flow 1: Given user2 and the invoice that deposited some amount in the user2's digital holding account " +
        "When the transaction to transfer the funds from user2's holding account to user2's BankAccount is completed " +
        "Then the Invoice's status should be 'Paid'");


    test(testUserDigitalBalance  == 0,
      "Flow 1: Given user2 and the invoice that deposited some amount in the user2's digital holding account " +
        "When the transaction to transfer the funds from user2's holding account to user2's BankAccount is completed " +
        "Then the user's holding account's balance should be 0 Balance found: " + testUserDigitalBalance );

  }

  public void flow2() {

  }

  public void runTest(X globalX) {
    x = globalX;
    userDAO_ = (DAO) x.get("localUserDAO");
    accountDAO_ = (DAO) x.get("accountDAO");
    contactDAO_ = (DAO) x.get("contactDAO");
    invoiceDAO_ = (DAO) x.get("invoiceDAO");
    /* Confirm Clean UP */
    cleanUserData();
    whiteListTestEmail();
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
    /* Confirm Clean UP */
    cleanUserData();
//    whiteListTestEmail();
    cleanAccountData();
    cleanContactData();
    cleanInvoiceData();
//    DAO smeUsertransactionDAO = ((DAO) smeUserContext.get("transactionDAO")).inX(smeUserContext);

// For purpose of testing balance and status
//invoice1Receivable = test1User.getSales(test1UserContext).find(invoice1Payable.getId());
//
///* bank account for test1User */
//account1 = new CABankAccount();
//account1.setName("bank test account1");
//account1.setDenomination("CAD");
//account1.setAccountNumber("87654321");
//account1.setInstitution(1);
//account1.setBranchId("54321");
//account1.setStatus(BankAccountStatus.VERIFIED);
//
//account1 = test1User.getAccounts(test1UserContext).put(account1);
//
//// Info for below test
//transferBalance = digAccount.findBalance(x);
//
//// Receive funds - User accepts payment selecting account1 as dst account.
//txn1 = new Transaction();
//txn1.setSourceAccount(invoice1Receivable.getDestinationAccount());
//txn1.setDestinationAccount(account1.getId());
//txn1.setInvoiceId(invoice1Receivable.getId());
//txn1.setAmount(invoice1Receivable.getAmount());
//
//txn1 = transactionDAO1.put(txn1);
//
//// For purpose of testing balance and status
//invoice1Receivable = test1User.getSales(test1UserContext).find(invoice1Receivable);
//paymentStatus = invoice1Receivable.getStatus();
//txn1.setStatus(TransactionStatus.COMPLETED);
//txn1 = transactionDAO.put(txn1);
//
//// TEST 5:  Is the status set correctly?
//test(paymentStatus == InvoiceStatus.DEPOSITING_MONEY && digAccount.findBalance(x) == 0, "Test 5: Invoice paid by moving money from payer's default DigitalAccount to User who accepted payment");
//
//
//// FLOW 2: create test where User(smeUser) sends money via invoice2 to an external Contact(test2Contact)
//
//test2Contact = new Contact();
//test2Contact.setEmail("fox@example.com");
//test2Contact.setFirstName("Fox");
//test2Contact.setLastName("McCloud");
//test2Contact.setOrganization("Example Company");
//test2Contact.setGroup("sme");
//
//test2Contact = smeUser.getContacts(smeUserContext).put(test2Contact);
//
//// Create a payable invoice with the test2Contact as the payee.
//invoice2Payable = new Invoice();
//invoice2Payable.setPayeeId(test2Contact.getId());
//invoice2Payable.setAmount(1);
//invoice2Payable.setSourceCurrency("CAD");
//invoice2Payable.setDestinationCurrency("CAD");
//invoice2Payable.setAccount(account.getId());
//
//invoice2Payable = smeUser.getExpenses(smeUserContext).put(invoice2Payable);
//
//digAccount2 = (Account) accountDAO.find(invoice2Payable.getDestinationAccount());
//
//// TEST 6:  Was destination account correctly set?
//test(digAccount2 != null && digAccount2 instanceof DigitalAccount && digAccount.getOwner() == smeUser.getId() && invoice2Payable.getStatus() == InvoiceStatus.UNPAID, "Test 6: Ablii User created Invoice dst account set to payer's default DigitalAccount");
//
//
//// Saving account balance for below test
//priorBalance = digAccount.findBalance(smeUserContext);
//
//// Pay the invoice.
//txn2 = new Transaction();
//txn2.setPayeeId(test2Contact.getId());
//txn2.setDestinationAccount(invoice2Payable.getDestinationAccount());
//txn2.setInvoiceId(invoice2Payable.getId());
//txn2.setAmount(invoice2Payable.getAmount());
//txn2.setPayerId(smeUser.getId());
//txn2.setSourceAccount(invoice2Payable.getAccount());
//txn2 = transactionDAO.put(txn2);
//// For purpose of testing balance
//txn2.setStatus(TransactionStatus.COMPLETED);
//txn2 = transactionDAO.put(txn2);
//
//// Update for test
//transferBalance = digAccount2.findBalance(x);
//invoice2Payable = smeUser.getExpenses(smeUserContext).find(invoice2Payable);
//
//// TEST 7: Invoice to Contact was paid and Completed. Is the InvoiceStatus set correctly?
//test(invoice2Payable.getStatus() == InvoiceStatus.PENDING_ACCEPTANCE && (transferBalance - priorBalance) == invoice2Payable.getAmount(), "Test 7: Invoice paid by moving money to payer's default DigitalAccount");
//
//// Mimic flow for Contact becoming User
//test3User = new User();
//test3User.setGroup("smeBusinessAdmin");
//test3User.setFirstName("Fox");
//test3User.setLastName("MkCloud");
//test3User.setEmail("fox@example.com");
//test3User.setEmailVerified(true);
//
//test3User = userDAO.put(test3User);
//X test3UserContext = foam.util.Auth.sudo(x, test3User);
//transactionDAO2 = test3UserContext.get("transactionDAO").inX(test3UserContext);
//
//// Note: test3User.getSales(test3UserContext).find(invoice2Payable.getId()) = null,
//// because this test is not linking invoices of contacts to their equivalent user.
//// This feature is reserved for the onboarding of a contact.
//// Below a put into the invoiceDAO will mimic the onboarding of a Contact - a SMEInvoiceDAO decorator will set things right
//invoice2Receivable = test3User.getSales(test3UserContext).put(invoice2Payable);
//
//// Test 8: Contact on Boards to User(test3User), has the invoice payee been changed?
//test(invoice2Receivable.getPayeeId() == test3User.getId(), "Test 8: testing whether the invoice PayeeId is updated in a put to the invoiceDAO test3User.getId() = " + test3User.getId() + " invoice2Receivable.getPayeeId() " + invoice2Receivable.getPayeeId());
//
///* bank account for test3User */
//account2 = new CABankAccount();
//account2.setName("bank test account2");
//account2.setDenomination("CAD");
//account2.setAccountNumber("87654300");
//account2.setInstitution(1);
//account2.setBranchId("54300");
//account2.setStatus(BankAccountStatus.VERIFIED);
//
//account2 = test3User.getAccounts(test3UserContext).put(account2);
//
//// Info for below test
//digAccount = (Account) accountDAO.find(invoice2Receivable.getDestinationAccount());
//transferBalance = digAccount.findBalance(x);
//
//// Receive funds - User accepts payment selecting account1 as dst account.
//txn3 = new Transaction();
//txn3.setSourceAccount(invoice2Receivable.getDestinationAccount());
//txn3.setDestinationAccount(account2.getId());
//txn3.setInvoiceId(invoice2Receivable.getId());
//txn3.setAmount(invoice2Receivable.getAmount());
//txn3 = transactionDAO2.put(txn3);
//
//// Updates: For purpose of testing balance and status
//invoice2Receivable = test3User.getSales(test3UserContext).find(invoice2Receivable);
//paymentStatus = invoice2Receivable.getStatus();
//txn3.setStatus(TransactionStatus.COMPLETED);
//txn3 = transactionDAO.put(txn3);
//
//// TEST 9: test3User adds a bank account and a transaction is made to send money to correct owner of funds(test3User). Was this done correctly?
//test(paymentStatus == InvoiceStatus.DEPOSITING_MONEY && digAccount.findBalance(smeUserContext) == 0, "Test 9: Invoice paid by moving money from payer's default DigitalAccount");
//
//// FLOW 3: create test to confirm a non-ablii/sme user does not go through the holding account flow
//
//// Mimic flow for Contact becoming User
//test4User = new User();
//test4User.setFirstName("Fo");
//test4User.setLastName("Bar");
//test4User.setEmail("foo@bar.com");
//test4User.setEmailVerified(true);
//
//// Mimic flow for Contact becoming User
//test5User = new User();
//test5User.setFirstName("BAR");
//test5User.setLastName("Foo");
//test5User.setEmail("bar@foo.com");
//test5User.setEmailVerified(true);
//
//test4User = userDAO.put(test4User);
//test5User = userDAO.put(test5User);
//X test4UserContext = foam.util.Auth.sudo(x, test4User);
//transactionDAO3 = test4UserContext.get("transactionDAO").inX(test4UserContext);
//
///* bank account for test3User */
//account3 = new CABankAccount();
//account3.setName("bank test account3");
//account3.setDenomination("CAD");
//account3.setAccountNumber("87654300");
//account3.setInstitution(1);
//account3.setBranchId("54300");
//account3.setStatus(BankAccountStatus.VERIFIED);
//
//account3 = test4User.getAccounts(test4UserContext).put(account3);
//
//invoice0 = new Invoice();
//invoice0.setPayeeId(test5User.getId());
//invoice0.setAmount(1);
//invoice0.setDestinationCurrency("CAD");
//invoice0.setAccount(account.getId());
//invoice0 = test4User.getExpenses(test4UserContext).put(invoice0);
//
//// Basic Trans
//txn4 = new Transaction();
//txn4.setSourceAccount(account3.getId());
//txn4.setInvoiceId(invoice0.getId());
//txn4.setAmount(1);
//txn4 = transactionDAO3.put(txn4);
//
//invoice0 = (Invoice)test4User.getExpenses(test4UserContext).find(invoice0.getId());
//// TEST 10: non-ablii/sme user will not follow the above tested transaction flow?
//test(invoice0.getStatus() != InvoiceStatus.PENDING_ACCEPTANCE, "Test 10: Confirm a non-ablii/sme user will not follow the above tested transaction flow. InvoiceStatus: " + invoice0.getStatus() + " payee = "+invoice0.getPayeeId() + " payer = " + invoice0.getPayerId() );
//
//// FLOW 4: Auto deposit while payment IN_TRANSIT
//
///* For test */
//// Test User 6
//test6User = new User();
//test6User.setGroup("smeBusinessAdmin");
//test6User.setFirstName("Warrior");
//test6User.setLastName("Wizard");
//test6User.setEmail("oxy@moron.com");
//test6User.setEmailVerified(true);
//
//test6User = userDAO.put(test6User);
//X test6UserContext = foam.util.Auth.sudo(x, test6User);
//transactionDAO4 = test1UserContext.get("transactionDAO").inX(test6UserContext);
//
//// Create a payable invoice with the test1User as the payee.
//invoice1 = new Invoice();
//invoice1.setPayeeId(test6User.getId());
//invoice1.setAmount(1);
//invoice1.setSourceCurrency("CAD");
//invoice1.setDestinationCurrency("CAD");
//invoice1.setAccount(account.getId());
//invoice1 = smeUser.getExpenses(smeUserContext).put(invoice1);
//
//// destination Account should be set to holding account( payer's default digital account)
//
//// Pay the invoice.
//txn = new Transaction();
//txn.setPayerId(smeUser.getId());
//txn.setPayeeId(test6User.getId());
//txn.setDestinationAccount(invoice1.getDestinationAccount());
//txn.setInvoiceId(invoice1.getId());
//txn.setAmount(invoice1.getAmount());
//txn.setPayerId(smeUser.getId());
//txn.setSourceAccount(invoice1.getAccount());
//txn = transactionDAO.put(txn);
//
//// prior completion of the Cashin to the holding account( payer's default digital account) the User adds a verified bank account
//
//// bank account for test6User
//account4 = new CABankAccount();
//account4.setName("bank test account 4");
//account4.setDenomination("CAD");
//account4.setAccountNumber("12345678");
//account4.setInstitution(1);
//account4.setBranchId("12345");
//account4.setIsDefault(true);
//account4.setStatus(BankAccountStatus.VERIFIED);
//
//account4 = test6User.getAccounts(test6UserContext).put(account4);
//
//// TEST 11 : Is the status what we expect for an inprogress Cashin from Bank to Digital.
//invoice1 = smeUser.getExpenses(smeUserContext).find(invoice1);
//test(invoice1.getStatus() == InvoiceStatus.IN_TRANSIT, "Test 11: in-transit Status check - prior cashin to holding account");
//
//// Update for test
//txn.setStatus(TransactionStatus.COMPLETED);
//txn = transactionDAO.put(txn);
//invoice1 = smeUser.getExpenses(smeUserContext).find(invoice1);
//
//// TEST 12: Is the status set correctly to reflect the initiation of the auto deposit to payee's actual bank account
//test(invoice1.getStatus() == InvoiceStatus.DEPOSITING_MONEY, "Test 12: Does the status set correctly to reflect the initiation of the auto deposit to payee's actual bank account");
//
////flow 5: Auto deposit with user adding a bank account
//
//test7User = new User();
//test7User.setGroup("smeBusinessAdmin");
//test7User.setFirstName("War");
//test7User.setLastName("Zone");
//test7User.setEmail("bob@marley.com");
//test7User.setEmailVerified(true);
//
//test7User = userDAO.put(test7User);
//X test7UserContext = foam.util.Auth.sudo(x, test7User);
//transactionDAO7 = test7UserContext.get("transactionDAO").inX(test7UserContext);
//
//// Create a payable invoice with the test7User as the payee.
//invoice2 = new Invoice();
//invoice2.setPayeeId(test7User.getId());
//invoice2.setAmount(1);
//invoice2.setSourceCurrency("CAD");
//invoice2.setDestinationCurrency("CAD");
//invoice2.setAccount(account.getId());
//invoice2 = smeUser.getExpenses(smeUserContext).put(invoice2);
//
//// destination Account should be set to holding account( payer's default digital account)
//
//// Pay the invoice.
//txn00 = new Transaction();
//txn00.setPayerId(smeUser.getId());
//txn00.setPayeeId(test6User.getId());
//txn00.setDestinationAccount(invoice2.getDestinationAccount());
//txn00.setInvoiceId(invoice2.getId());
//txn00.setAmount(invoice2.getAmount());
//txn00.setPayerId(smeUser.getId());
//txn00.setSourceAccount(invoice2.getAccount());
//txn00 = transactionDAO.put(txn00);
//txn00.setStatus(TransactionStatus.COMPLETED);
//txn00 = transactionDAO.put(txn00);
//
//// bank account for test7User
//account5 = new CABankAccount();
//account5.setName("bank test account 5");
//account5.setDenomination("CAD");
//account5.setAccountNumber("12345688");
//account5.setInstitution(1);
//account5.setBranchId("12545");
//account5.setIsDefault(true);
//account5.setStatus(BankAccountStatus.VERIFIED);
//
//account5 = test7User.getAccounts(test7UserContext).put(account5);
//
//// TEST 13: Is the status what we expect for funds in holding Digital.
//invoice2 = smeUser.getExpenses(smeUserContext).find(invoice2);
//test(invoice2.getStatus() == InvoiceStatus.PENDING_ACCEPTANCE, "Test 13: Status check");
//
//bankAccVer = (BankAccountVerifierService) test7UserContext.get("bankAccountVerification");
//bankAccVer.verify(test7UserContext, account5.getId(), -1000000);
//
//invoice2 = smeUser.getExpenses(smeUserContext).find(invoice2);
//
//// TEST 14: Is the status set correctly to reflect the initiation of the auto deposit to payee's actual bank account
//test(invoice2.getStatus() == InvoiceStatus.DEPOSITING_MONEY, "Test 14: Does the status set correctly to reflect the initiation of the auto deposit to payee's actual bank account");
//
///* Clean UP */
//userDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "bob@marley.com")).removeAll();
//userDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "oxy@moron.com")).removeAll();
//userDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "unicorn@princess.com")).removeAll();
//userDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "prince@caspen.com")).removeAll();
//userDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "fox@example.com")).removeAll();
//userDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "foo@bar.com")).removeAll();
//userDAO.where(foam.mlang.MLang.EQ(User.EMAIL, "bar@foo.com")).removeAll();
//accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account")).removeAll();
//accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account1")).removeAll();
//accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account2")).removeAll();
//accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account3")).removeAll();
//accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account 4")).removeAll();
//accountDAO.where(foam.mlang.MLang.EQ(Account.NAME, "bank test account 5")).removeAll();
//contactDAO.where(foam.mlang.MLang.EQ(Contact.EMAIL, "fox@example.com")).removeAll();
//invoiceDAO.where(foam.mlang.MLang.EQ(Invoice.ID, invoice1Payable.getId())).removeAll();
//invoiceDAO.where(foam.mlang.MLang.EQ(Invoice.ID, invoice1Receivable.getId())).removeAll();
//invoiceDAO.where(foam.mlang.MLang.EQ(Invoice.ID, invoice2Payable.getId())).removeAll();
//invoiceDAO.where(foam.mlang.MLang.EQ(Invoice.ID, invoice2Receivable.getId())).removeAll();
//whitelistedEmailDAO.remove(new EmailWhitelistEntry.Builder(x).setId("bob@marley.com").build());
//whitelistedEmailDAO.remove(new EmailWhitelistEntry.Builder(x).setId("oxy@moron.com").build());
//whitelistedEmailDAO.remove(new EmailWhitelistEntry.Builder(x).setId("unicorn@princess.com").build());
//whitelistedEmailDAO.remove(new EmailWhitelistEntry.Builder(x).setId("prince@caspen.com").build());
//whitelistedEmailDAO.remove(new EmailWhitelistEntry.Builder(x).setId("fox@example.com").build());
//whitelistedEmailDAO.remove(new EmailWhitelistEntry.Builder(x).setId("foo@bar.com").build());
//whitelistedEmailDAO.remove(new EmailWhitelistEntry.Builder(x).setId("bar@foo.com").build());
  }
}
