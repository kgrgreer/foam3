package net.nanopay.tx.test;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import foam.core.FObject;
import foam.core.X;
import foam.dao.DAO;
import foam.mlang.MLang;
import foam.mlang.sink.Count;
import foam.nanos.auth.User;
import foam.test.TestUtils;
import foam.util.SafetyUtil;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.DigitalTransaction;
import net.nanopay.tx.FeeTransfer;
import net.nanopay.tx.Transfer;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

public class TransactionDAOTest
  extends foam.nanos.test.Test
{
  User sender_, receiver_;
  X x_;
  CABankAccount senderBankAccount_;
  DigitalAccount senderDigitalAccount_;
  DigitalAccount destinationDigitalAccount_;
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
    testCashOut();
  }


  public X addUsers() {
    //x = TestUtils.mockDAO(x, "localUserDAO");

    sender_ = TransactionTestUtil.createUser(x_);
    receiver_ = TransactionTestUtil.createUser(x_);

    senderDigitalAccount_ = DigitalAccount.findDefault(x_, sender_, "CAD");
    destinationDigitalAccount_ = TransactionTestUtil.RetrieveDigitalAccount(x_, receiver_, "CAD", senderDigitalAccount_);
    return x_;
  }


  public void testEmailVerified() {
    addUsers();

    Transaction txn = new Transaction();
    //txn.setId(1);
    txn.setPayerId(sender_.getId());
    txn.setPayeeId(receiver_.getId());
    txn.setAmount(100L);

    receiver_.setEmailVerified(false);

    sender_.setEmailVerified(false);

    sender_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, sender_);
    receiver_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, receiver_);

    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "You must verify email to send money",
      foam.nanos.auth.AuthorizationException.class
      ),
      "Exception: email must be verified");
  }

  public void testNoneTxn() {
    addUsers();
    Transaction txn = new Transaction();

    txn.setPayerId(sender_.getId());
    txn.setPayeeId(receiver_.getId());
    txn.setAmount(0L);
    txn.setDestinationAmount(1L);


    receiver_.setEmailVerified(true);
    sender_.setEmailVerified(true);

    sender_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, sender_);
    receiver_ = (User) ((DAO) x_.get("localUserDAO")).put_(x_, receiver_);


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


    txn.setAmount( senderDigitalAccount_.findBalance(x_)+ 1);
    txn.setPayeeId(receiver_.getId());
    txn.setDestinationAccount(destinationDigitalAccount_.getId());
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      null,
      net.nanopay.account.InsufficientBalanceException.class), "InsufficientBalanceException");

    // Test return transactionStatus
    cashIn();
    long initialBalanceSender =   senderDigitalAccount_.findBalance(x_);
    long initialBalanceReceiver = 0;
    Transaction transaction = (Transaction) txnDAO.put_(x_, txn.fclone()).fclone();
    test(transaction.getStatus() == TransactionStatus.COMPLETED, "transaction is completed");
    test(transaction instanceof DigitalTransaction, "transaction is NONE type");
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
    setBankAccount(BankAccountStatus.UNVERIFIED);
    txn.setPayeeId(sender_.getId());
    txn.setSourceAccount(senderBankAccount_.getId());
    txn.setDestinationAccount(senderDigitalAccount_.getId());
    txn.setAmount(1l);
    setBankAccount(BankAccountStatus.VERIFIED);
    long senderInitialBalance = (long) senderDigitalAccount_.findBalance(x_);
    FObject obj = txnDAO.put_(x_, txn);
    FObject x =  obj.fclone();
    Transaction tx = (Transaction) x;
    test(tx instanceof CITransaction, "Transaction type is CASHIN, "+ tx.getClass().getName() );
    test(tx.getStatus() == TransactionStatus.PENDING, "CashIn transaction has status pending" );
    test(senderInitialBalance == senderDigitalAccount_.findBalance(x_), "While cash in is pending balance remains the same" );
    tx.setStatus(TransactionStatus.COMPLETED);
    Transaction n = (Transaction) txnDAO.put_(x_, tx);
    tx = (Transaction) txnDAO.find_(x_, tx.getId()).fclone();
    test(tx.getStatus() == TransactionStatus.COMPLETED, "CashIn transaction has status completed" );
    test(senderInitialBalance + tx.getAmount() == senderDigitalAccount_.findBalance(x_), "After transaction is completed balance is updated" );
    // by sending the txn in declined status, we are expecting the returned txn to remain in completed, but the balance to change.
    tx.setStatus(TransactionStatus.DECLINED);
    tx = (Transaction) txnDAO.put_(x_, tx);
    Transaction tx2 = (Transaction) txnDAO.find_(x_, tx.getId());
    test(tx.getStatus() == TransactionStatus.COMPLETED, "CashIn transaction "+ tx.getId() + " remains in status "+tx.getStatus() );
    // the transaction that is found should actually remain completed.
    test(tx2.getStatus() == TransactionStatus.COMPLETED, "CashIn transaction on find "+ tx2.getId() +  " is in "+ tx2.getStatus());
    //find the reversal
    Transaction tx3 = (Transaction) txnDAO.find(EQ(Transaction.ASSOCIATE_TRANSACTION, tx2.getId()));
    test( tx3 instanceof DigitalTransaction && tx3.getStatus() == TransactionStatus.COMPLETED , "Reversal txn is a digitalTransaction which is complete..");
    Long balance = senderDigitalAccount_.findBalance(x_);
    // the balance should have reverted
    test( senderInitialBalance == balance, "After transaction is DECLINED, balance is reverted by ReverseCIRule. initialBalance: "+ senderInitialBalance +" balance: "+balance );
  }

  public void testCashOut() {
    Transaction txn = new Transaction();
    setBankAccount(BankAccountStatus.UNVERIFIED);
    txn.setPayerId(sender_.getId());
    txn.setDestinationAccount(senderBankAccount_.getId());
    txn.setAmount(1l);
    test(TestUtils.testThrows(
      () -> txnDAO.put_(x_, txn),
      "Destination bank account must be verified",
      RuntimeException.class
      ),"Bank account must be verified to cash out.");
    setBankAccount(BankAccountStatus.VERIFIED);
    long senderInitialBalance = (long) senderDigitalAccount_.findBalance(x_);
    Transaction tx = (Transaction) txnDAO.put_(x_, txn.fclone()).fclone();

    Transaction t = (Transaction) txnDAO.find_(x_, tx).fclone();

    test( t instanceof COTransaction, "Transaction type is CASHOUT" );

    test( t.getStatus()  == TransactionStatus.PENDING, "CashOUT transaction has status pending" );
    test( senderInitialBalance - (txn.getAmount() + getFee(t)) ==  (Long) senderDigitalAccount_.findBalance(x_), "Pending status. Cashout updated balance" );
    t.setStatus(TransactionStatus.SENT);
    t = (Transaction) txnDAO.put_(x_, t);
    test(t.getStatus() == TransactionStatus.SENT, "CashOut transaction has status sent" );
    test( senderInitialBalance - (txn.getAmount() + getFee(t)) ==  (Long) senderDigitalAccount_.findBalance(x_), "After cashout transaction is sent balance updated" );


  }

  public void setBankAccount(BankAccountStatus status) {
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).find(AND(EQ(CABankAccount.OWNER, sender_.getId()), INSTANCE_OF(CABankAccount.class)));
    if ( senderBankAccount_ == null ) {
      senderBankAccount_ = new CABankAccount();
      senderBankAccount_.setAccountNumber("2131412443534534");
      senderBankAccount_.setOwner(sender_.getId());
    } else {
      senderBankAccount_ = (CABankAccount)senderBankAccount_.fclone();
    }
    if ( status.equals(BankAccountStatus.UNVERIFIED) ) {
      senderBankAccount_.setIsDefault(false);
    }
    senderBankAccount_.setStatus(status);
    senderBankAccount_ = (CABankAccount) ((DAO)x_.get("localAccountDAO")).put_(x_, senderBankAccount_).fclone();
  }

  public void cashIn() {
    setBankAccount(BankAccountStatus.VERIFIED);
    Transaction txn = new Transaction();
    txn.setAmount(100000L);
    txn.setSourceAccount(senderBankAccount_.getId());
    txn.setDestinationAccount(senderDigitalAccount_.getId());
    txn.setPayeeId(sender_.getId());
    txn = (Transaction) ((DAO) x_.get("localTransactionDAO")).put_(x_, txn).fclone();
    txn.setStatus(TransactionStatus.COMPLETED);
    ((DAO) x_.get("localTransactionDAO")).put_(x_, txn);
  }

  private Long getFee(Transaction tx){
    Long fee = 0l;
    if ( null != tx ) {
      Transfer[] transfers = tx.getTransfers();
      for ( Transfer transfer : transfers ) {
        if ( transfer instanceof FeeTransfer && transfer.getAmount() > 0 ) {
          fee += transfer.getAmount();
        }
      }
    }
    return fee;
  }

}
