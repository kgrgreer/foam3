package net.nanopay.tx;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.cico.model.TransactionType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

public class TransactionDAOTest
  extends foam.nanos.test.Test
{
  User sender_, receiver_;
  X x_;
  BankAccount senderBankAccount_;
  DAO txnDAO;
  public void runTest(X x) {
    txnDAO = (DAO) x.get("localTransactionDAO");
    // x = TestUtils.mockDAO(x, "localTransactionDAO");
    //x = TestUtils.mockDAO(x, "localAccountDAO");
    //x = addUsers(x);
    x_ = x;
    testEmailVerified();
    testNoneTxn();
    testCashIn();
  }

  public X addUsers() {
    //x = TestUtils.mockDAO(x, "localUserDAO");

    sender_ = (User) ((DAO)x_.get("localUserDAO")).find(EQ(User.EMAIL,"testuser1@nanopay.net" ));
    if ( sender_ == null ) {
      sender_ = new User();
      sender_.setEmail("testUser1@nanopay.net");
    }
    sender_ = (User) sender_.fclone();
    sender_.setEmailVerified(true);
    sender_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, sender_)).fclone();

    receiver_ = (User) ((DAO)x_.get("localUserDAO")).find(EQ(User.EMAIL,"testuser2@nanopay.net" ));
    if ( receiver_ == null ) {
      receiver_ = new User();
      receiver_.setEmail("testUser2@nanopay.net");
    }
    receiver_ = (User) receiver_.fclone();
    receiver_.setEmailVerified(true);
    receiver_ = (User) (((DAO) x_.get("localUserDAO")).put_(x_, receiver_)).fclone();

    return x_;
  }


  public void testEmailVerified() {
    addUsers();

    Transaction txn = new Transaction();
    //txn.setId(1);
    txn.setPayerId(sender_.getId());
    txn.setPayeeId(receiver_.getId());
    txn.setAmount(100L);

    //testUser2 = (User) testUser2.fclone();
    //testUser1 = (User) testUser1.fclone();

    receiver_.setEmailVerified(false);

    sender_.setEmailVerified(false);

    sender_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, sender_);
    receiver_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, receiver_);

    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "You must verify your email to send money",
      RuntimeException.class
      ),
      "Exception: email must be verified");

    /*testUser1 = (User) testUser1.fclone();
    testUser2 = (User) testUser2.fclone();

    testUser2.setEmailVerified(true);
    testUser1.setEmailVerified(false);

    testUser1 = (User) ((DAO) x.get("localUserDAO")).put_(x, testUser1);
    testUser2 = (User) ((DAO) x.get("localUserDAO")).put_(x, testUser2);

    test(TestUtils.testThrows(
      () -> txnDAO.put_(x, txn),
      "You must verify your email to send money",
      RuntimeException.class
      ),
      "thrown an exception");*/
  }

  public void testNoneTxn() {
    addUsers();
    Transaction txn = new Transaction();

    txn.setPayerId(sender_.getId());
    txn.setPayeeId(receiver_.getId());
    txn.setAmount(0L);


    receiver_.setEmailVerified(true);
    sender_.setEmailVerified(true);

    sender_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, sender_);
    receiver_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, receiver_);


    // Test amount cannot be zero
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Zero transfer disallowed.",
      RuntimeException.class), "Exception: Txn amount cannot be zero");

    // Test payer user exists
    txn.setAmount(1L);
    txn.setPayerId(3L);
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Payer not found",
      RuntimeException.class), "Exception: Payer user must exist");

    // Test payee user exists
    txn.setAmount(1L);
    txn.setPayerId(sender_.getId());
    txn.setPayeeId(3L);
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Payee not found",
      RuntimeException.class), "Exception: Payee user must exist");


    // Test amount cannot be negative
    txn.setAmount(-1L);
    txn.setPayeeId(receiver_.getId());
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Amount cannot be negative",
      RuntimeException.class), "Exception: Txn amount cannot be negative");


    txn.setAmount((DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_) == null ? 0 : (Long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_))+ 1);
    txn.setPayeeId(receiver_.getId());
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Insufficient balance in account " + DigitalAccount.findDefault(x_, sender_, "CAD").getId(),
      RuntimeException.class), "Exception: Insufficient balance");

    // Test return transactionStatus
    cashIn();
    long initialBalanceSender = DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_) == null ? 0 : (Long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_);
    long initialBalanceReceiver = DigitalAccount.findDefault(x_, receiver_, "CAD").findBalance(x_) == null ? 0 : (Long) DigitalAccount.findDefault(x_, receiver_, "CAD").findBalance(x_);
    Transaction transaction = (Transaction) txnDAO.put_(x_, txn);
    test(transaction.getStatus() == TransactionStatus.COMPLETED, "transaction is completed");
    test(transaction.getType() == TransactionType.NONE, "transaction is NONE type");
    test(transaction.findSourceAccount(x_) instanceof DigitalAccount, "Source account is digital Account");
    test(transaction.findDestinationAccount(x_) instanceof DigitalAccount, "Destination account is digital Account");
    test(transaction.findDestinationAccount(x_).getOwner() == receiver_.getId(), "Destination account belongs to receiver");
    test(transaction.findSourceAccount(x_).getOwner() == sender_.getId(), "Source account belongs to receiver");
    Long receiverBalance = (Long) transaction.findDestinationAccount(x_).findBalance(x_);
    Long senderBalance = (Long) transaction.findSourceAccount(x_).findBalance(x_);
    test(senderBalance == initialBalanceSender - transaction.getAmount(), "Sender balance is correct");
    test(receiverBalance == initialBalanceReceiver + transaction.getAmount(), "Receiver balance is correct");
  }

  public void testCashIn() {
    Transaction txn = new Transaction();
    txn.setType(TransactionType.CASHIN);
    if ( senderBankAccount_ == null ) {
      senderBankAccount_ = new BankAccount();
      senderBankAccount_.setStatus(BankAccountStatus.VERIFIED);
      senderBankAccount_.setAccountNumber("2131412443534534");
      senderBankAccount_.setOwner(sender_.getId());
    } else {
      senderBankAccount_ = (BankAccount) senderBankAccount_.fclone();
    }
    senderBankAccount_.setStatus(BankAccountStatus.UNVERIFIED);
    senderBankAccount_ = (BankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, senderBankAccount_).fclone();
    txn.setPayeeId(sender_.getId());
    txn.setSourceAccount(senderBankAccount_.getId());
    txn.setAmount(666l);
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Bank account must be verified",
      RuntimeException.class), "Exception: Bank account must be verified");
    senderBankAccount_.setStatus(BankAccountStatus.VERIFIED);
    senderBankAccount_ = (BankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, senderBankAccount_);
    long senderInitialBalance = (long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_);
    Transaction tx = (Transaction) txnDAO.put_(x_, txn).fclone();
    test(tx.getStatus() == TransactionStatus.PENDING, "CashIn transaction has status pending" );
    test( senderInitialBalance ==  (long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_), "While cash in is pending balance remains the same" );
    tx.setStatus(TransactionStatus.COMPLETED);
    txnDAO.put_(x_, tx);
    test(tx.getStatus() == TransactionStatus.COMPLETED, "CashIn transaction has status completed" );
    test( senderInitialBalance + txn.getAmount() ==  (Long) DigitalAccount.findDefault(x_, sender_, "CAD").findBalance(x_), "After transaction is completed balance is updated" );

  }

  public void cashIn() {
    senderBankAccount_ = (BankAccount) ((DAO)x_.get("localAccountDAO")).find(AND(EQ(BankAccount.OWNER, sender_.getId()), INSTANCE_OF(BankAccount.class)));
    if ( senderBankAccount_ == null ) {
      senderBankAccount_ = new BankAccount();
      senderBankAccount_.setAccountNumber("2131412443534534");
      senderBankAccount_.setOwner(sender_.getId());
    } else {
      senderBankAccount_ = (BankAccount)senderBankAccount_.fclone();
    }
    senderBankAccount_.setStatus(BankAccountStatus.VERIFIED);
    senderBankAccount_ = (BankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, senderBankAccount_);
    Transaction txn = new Transaction();
    txn.setAmount(100000L);
    txn.setSourceAccount(senderBankAccount_.getId());
    txn.setPayeeId(sender_.getId());
    txn.setType(TransactionType.CASHIN);
    txn = (Transaction) (((DAO) x_.get("localTransactionDAO")).put_(x_, txn)).fclone();
    txn.setStatus(TransactionStatus.COMPLETED);
    ((DAO) x_.get("localTransactionDAO")).put_(x_, txn);
  }

}
