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

package net.nanopay.bank.test;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;

import java.util.List;

import foam.core.CompoundException;
import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.auth.LifecycleState;
import foam.nanos.auth.Group;
import foam.nanos.auth.GroupPermissionJunction;
import foam.nanos.auth.Address;
import foam.test.TestUtils;
import net.nanopay.account.DigitalAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.USBankAccount;
import net.nanopay.tx.AbliiTransaction;
import net.nanopay.fx.afex.AFEXTransaction;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.planner.AFEXTransactionPlanner;
import net.nanopay.fx.afex.AFEXServiceProvider;
import net.nanopay.fx.afex.AFEX;
import net.nanopay.fx.afex.AFEXServiceMock;
import net.nanopay.fx.afex.AFEXUser;
import net.nanopay.fx.afex.AFEXBeneficiary;
import net.nanopay.payment.Institution;

public class BankVerificationTest
  extends foam.nanos.test.Test {

  X x_;
  User sender_;
  User receiver_;
  User sender_2;
  User receiver_2;
  User user1;
  User user2;
  CABankAccount sender_CA;
  CABankAccount receiver_CA;
  CABankAccount sender_CA_2;
  CABankAccount receiver_CA_2;
  CABankAccount user1CABankAccount;
  USBankAccount user2USBankAccount;
  DAO txnDAO;
  DAO accDAO;
  DAO txnQuoteDAO;
  DAO userDAO;
  DAO permissionJunctionDAO_;
  DAO groupDAO_;
  AFEXServiceProvider afexService;
  AFEXTransactionPlanner planDAO;

  public void runTest(X x) {
    x_ = x;
    txnDAO = (DAO) x_.get("localTransactionDAO");
    accDAO = (DAO) x_.get("localAccountDAO");
    userDAO = (DAO) x_.get("localUserDAO");
    txnQuoteDAO = (DAO) x_.get("localTransactionPlannerDAO");
    //set up receiver and sender
    sender_ = addUser("BankVerification1@transactiontest.ca");
    receiver_ = addUser("BankVerification2@transactiontest.ca");
    sender_2 = addUser("BankVerification3@transactiontest.ca");
    receiver_2 = addUser("BankVerification4@transactiontest.ca");
    user1 = addUser("BankVerification5@transactiontest.ca");
    user2 = addUsUser("BankVerification6@transactiontest.ca");
    // setUp bank account
    setup();
    //set up AFEX transaction
    setUpAfexTest();
    /* TODO: this test method is no longer valid. if we want to test this need to do other way.
    testCICOTransactionCompleted();
    testCICOTransactionFailedWithVerifiedBy();
    testCICOTransactionFailedWithoutVerfiedBy();
    AFEXTransactionFailedWithoutVerfiedBy();
    AFEXTransactionCompleted();
    AFEXTransactionFailedWithVerifiedBy();
    */
  }

  public void setup() {
    sender_CA = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, sender_.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();

    receiver_CA = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, receiver_.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();

    sender_CA_2 = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, sender_2.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();

    receiver_CA_2 = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, receiver_2.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();

    user1CABankAccount = (CABankAccount) (accDAO.find(
      AND(
        EQ(CABankAccount.OWNER, user1.getId()),
        INSTANCE_OF(CABankAccount.class)))).fclone();

    user2USBankAccount = (USBankAccount) (accDAO.find(
      AND(
        EQ(USBankAccount.OWNER, user2.getId()),
        INSTANCE_OF(USBankAccount.class)))).fclone();
  }

  public User addUser(String email) {
    User user;
    DigitalAccount dAcc1;
    CABankAccount bank;

    user = (User) userDAO.inX(x_).find(EQ(User.EMAIL, email));
    if ( user == null ) {
      user = new User();
      user.setEmail(email);
      user.setFirstName("Francis");
      user.setLastName("Filth");
      user.setEmailVerified(true);
      user.setGroup("business");
      user.setSpid("test");
      user = (User) userDAO.put(user);
      user = (User) user.fclone();
    }

    dAcc1 = (DigitalAccount) accDAO.inX(x_).find(
      AND(
        EQ(DigitalAccount.OWNER, user.getId()),
        EQ(DigitalAccount.DENOMINATION, "CAD"),
        INSTANCE_OF(DigitalAccount.class)));
    if ( dAcc1 == null ) {
      dAcc1 = new DigitalAccount();
      dAcc1.setOwner(user.getId());
      dAcc1.setDenomination("CAD");
      accDAO.put(dAcc1);
    }

    bank = (CABankAccount) accDAO.inX(x_).find(
      AND(
        EQ(CABankAccount.OWNER, user.getId()),
        INSTANCE_OF(CABankAccount.class)));

    if ( bank == null ) {
      bank = new CABankAccount();
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank.setAccountNumber("12345678");
      bank.setInstitutionNumber("123");
      bank.setBranchId("12334");
      bank.setOwner(user.getId());
      bank.setCreatedBy(user.getId());
      accDAO.put(bank);
    }

    return user;
  }

  public User addUsUser(String email) {
    User user;
    DigitalAccount dAcc1;
    USBankAccount bank;

    user = (User) userDAO.inX(x_).find(EQ(User.EMAIL, email));
    if ( user == null ) {
      user = new User();
      user.setEmail(email);
      user.setFirstName("Francis_US");
      user.setLastName("Filth_US");
      user.setEmailVerified(true);
      user.setGroup("business");
      user.setSpid("test");
      user = (User) userDAO.put(user);
      user = (User) user.fclone();
    }

    dAcc1 = (DigitalAccount) accDAO.inX(x_).find(
      AND(
        EQ(DigitalAccount.OWNER, user.getId()),
        EQ(DigitalAccount.DENOMINATION, "CAD"),
        INSTANCE_OF(DigitalAccount.class)));
    if ( dAcc1 == null ) {
      dAcc1 = new DigitalAccount();
      dAcc1.setOwner(user.getId());
      dAcc1.setDenomination("CAD");
      accDAO.put(dAcc1);
    }

    bank = (USBankAccount) accDAO.inX(x_).find(
      AND(
        EQ(USBankAccount.OWNER, user.getId()),
        INSTANCE_OF(USBankAccount.class)));

    if ( bank == null ) {
      bank = new USBankAccount();
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank.setAccountNumber("00000000000");
      bank.setInstitutionNumber("00000000000");
      bank.setOwner(user.getId());
      accDAO.put(bank);
    }

    return user;
  }

  private void setUpAfexTest() {
    AFEX afex = new AFEXServiceMock(x_);
    afexService = new AFEXServiceProvider(x_, afex);
    planDAO = new AFEXTransactionPlanner.Builder(x_).build();

    permissionJunctionDAO_ = (DAO) x_.get("groupPermissionJunctionDAO");
    groupDAO_ = (DAO) x_.get("localGroupDAO");
    Address businessAddress = new Address();
    businessAddress.setCity("Toronto");
    businessAddress.setCountryId("CA");

    Group businessGroup = (Group) groupDAO_.find("business");
    if ( businessGroup == null ) {
      businessGroup = new Group.Builder(x_)
        .setId("business")
        .build();
      businessGroup = (Group) groupDAO_.put(businessGroup);
    }
    permissionJunctionDAO_.put(
      new GroupPermissionJunction.Builder(x_)
      .setSourceId("business")
      .setTargetId("digitalaccount.default.create")
      .build()
    );

    accDAO.put(user1CABankAccount);
    accDAO.put(user2USBankAccount);


    DAO afexUserDAO = (DAO) x_.get("afexUserDAO");
    DAO afexBeneficiaryDAO = (DAO) x_.get("afexBeneficiaryDAO");

    AFEXUser b1 = new AFEXUser.Builder(x_)
      .setApiKey("abc123")
      .setAccountNumber("0001")
      .setUser(user1.getId())
      .setStatus("Active")
      .build();
    afexUserDAO.put(b1);

    AFEXUser b2 = new AFEXUser.Builder(x_)
      .setApiKey("123abc")
      .setAccountNumber("0002")
      .setUser(user2.getId())
      .setStatus("Active")
      .build();
    afexUserDAO.put(b2);

    AFEXBeneficiary beneficiary1 = new AFEXBeneficiary.Builder(x_)
      .setContact(user2.getId())
      .setOwner(user1.getId())
      .setStatus("Active")
      .build();
    afexBeneficiaryDAO.put(beneficiary1);

    AFEXBeneficiary beneficiary2 = new AFEXBeneficiary.Builder(x_)
      .setContact(user1.getId())
      .setOwner(user2.getId())
      .setStatus("Active")
      .build();
    afexBeneficiaryDAO.put(beneficiary2);

  }

    public void testCICOTransactionCompleted(){
      AbliiTransaction txn = new AbliiTransaction.Builder(x_)
        .setSourceAccount(sender_CA.getId())
        .setDestinationAccount(receiver_CA.getId())
        .setSourceCurrency(sender_CA.getDenomination())
        .setDestinationCurrency(receiver_CA.getDenomination())
        .setPayeeId(receiver_.getId())
        .setPayerId(sender_.getId())
        .setAmount(123)
        .setDestinationAmount(123)
        .build();
      TransactionQuote tq = new TransactionQuote();
      tq.setRequestTransaction(txn);
      tq = (TransactionQuote) txnQuoteDAO.put(tq).fclone();
      Transaction txn1 = tq.getPlan();
      Transaction txn2 = txn1.getNext()[0];//compliance txn
      Transaction txn3 = txn2.getNext()[0];
      Transaction txn4 = txn3.getNext()[0];
      Transaction txn5 = txn4.getNext()[0];
      txn3 = (Transaction) txnDAO.put(txn3).fclone();
      txn5 = (Transaction) txnDAO.put(txn5).fclone();
      txn3.setStatus(TransactionStatus.COMPLETED);
      txn5.setStatus(TransactionStatus.COMPLETED);
      txnDAO.put(txn3);
      txnDAO.put(txn5);
      sender_CA = (CABankAccount) accDAO.find(sender_CA);
      receiver_CA = (CABankAccount) accDAO.find(receiver_CA);
      test((sender_CA.getVerifiedBy()).equals("TRANSACTION"), "source account is verified by transaction ");
      test((receiver_CA.getVerifiedBy()).equals("TRANSACTION"), "destination account is verified by transaction ");
  }

    public void testCICOTransactionFailedWithVerifiedBy(){
      AbliiTransaction txn = new AbliiTransaction.Builder(x_)
        .setSourceAccount(sender_CA.getId())
        .setDestinationAccount(receiver_CA.getId())
        .setSourceCurrency(sender_CA.getDenomination())
        .setDestinationCurrency(receiver_CA.getDenomination())
        .setPayeeId(receiver_.getId())
        .setPayerId(sender_.getId())
        .setAmount(123)
        .setDestinationAmount(123)
        .build();
      TransactionQuote tq = new TransactionQuote();
      tq.setRequestTransaction(txn);
      tq = (TransactionQuote) txnQuoteDAO.put(tq).fclone();
      Transaction txn1 = tq.getPlan();
      Transaction txn2 = txn1.getNext()[0];//compliance txn
      Transaction txn3 = txn2.getNext()[0];
      Transaction txn4 = txn3.getNext()[0];
      Transaction txn5 = txn4.getNext()[0];
      txn3 = (Transaction) txnDAO.put(txn3).fclone();
      txn5 = (Transaction) txnDAO.put(txn5).fclone();
      txn3.setStatus(TransactionStatus.FAILED);
      txn5.setStatus(TransactionStatus.FAILED);
      txnDAO.put(txn3);
      txnDAO.put(txn5);
      sender_CA = (CABankAccount) accDAO.find(sender_CA);
      receiver_CA = (CABankAccount) accDAO.find(receiver_CA);
      test((sender_CA.getStatus()).equals(BankAccountStatus.VERIFIED), "Source bank account status stay VERIFIED if verifiedBy is set");
      test((receiver_CA.getStatus()).equals(BankAccountStatus.VERIFIED), "Destination bank account status stay VERIFIED if verifiedBy is set");
  }

    public void testCICOTransactionFailedWithoutVerfiedBy(){
      AbliiTransaction txn = new AbliiTransaction.Builder(x_)
        .setSourceAccount(sender_CA_2.getId())
        .setDestinationAccount(receiver_CA_2.getId())
        .setSourceCurrency(sender_CA_2.getDenomination())
        .setDestinationCurrency(receiver_CA_2.getDenomination())
        .setPayeeId(receiver_2.getId())
        .setPayerId(sender_2.getId())
        .setAmount(123)
        .setDestinationAmount(123)
        .build();
      TransactionQuote tq = new TransactionQuote();
      tq.setRequestTransaction(txn);
      tq = (TransactionQuote) txnQuoteDAO.put(tq).fclone();
      Transaction txn1 = tq.getPlan();
      Transaction txn2 = txn1.getNext()[0];//compliance txn
      Transaction txn3 = txn2.getNext()[0];
      Transaction txn4 = txn3.getNext()[0];
      Transaction txn5 = txn4.getNext()[0];
      txn3 = (Transaction) txnDAO.put(txn3).fclone();
      txn5 = (Transaction) txnDAO.put(txn5).fclone();
      txn3.setStatus(TransactionStatus.FAILED);
      txn5.setStatus(TransactionStatus.FAILED);
      txnDAO.put(txn3);
      txnDAO.put(txn5);
      sender_CA_2 = (CABankAccount) accDAO.find(sender_CA_2);
      receiver_CA_2 = (CABankAccount) accDAO.find(receiver_CA_2);
      test((sender_CA_2.getStatus()).equals(BankAccountStatus.UNVERIFIED), "Source bank account need to be verified by a trust agent");
      test((receiver_CA_2.getLifecycleState()).equals(LifecycleState.DELETED), "Destination bank account need to be verified by a trust agent ");
  }

      public void AFEXTransactionFailedWithoutVerfiedBy(){
      //cash in
      Transaction txn = new Transaction();
      txn.setAmount(100000L);
      txn.setSourceAccount(user1CABankAccount.getId());
      txn.setPayeeId(user1.getId());
      DigitalAccount digitalAccount = DigitalAccount.findDefault(x_, user1, "CAD");
      txn.setDestinationAccount(digitalAccount.getId());
      txn.setStatus(TransactionStatus.COMPLETED);
      txnDAO.put(txn);

      TransactionQuote quote = new TransactionQuote.Builder(x_).build();
      Transaction transaction = new Transaction.Builder(x_).build();
      transaction.setPayerId(user1.getId());
      transaction.setSourceAccount(user1CABankAccount.getId());
      transaction.setPayeeId(user2.getId());
      transaction.setDestinationAccount(user2USBankAccount.getId());
      transaction.setDestinationAmount(100l);
      transaction.setSourceCurrency("CAD");
      transaction.setDestinationCurrency("USD");
      quote.setRequestTransaction(transaction);
      quote.setDestinationAccount(user2USBankAccount);
      quote.setSourceAccount(user1CABankAccount);

      Transaction tx1 = (Transaction) planDAO.generateTransaction(x_, quote, afexService);
      Transaction tx2 = (tx1.getNext()[0]).getNext()[0].getNext()[0];
      tx2.setPlanner("13df0d76-ba3e-4287-b42e-c7ceff059dd8"); //TODO: actually activate and plan with this planner
      tx2 = (AFEXTransaction) txnDAO.put(tx2).fclone();
      tx2.setStatus(TransactionStatus.FAILED);
      txnDAO.put(tx2);
      user2USBankAccount = (USBankAccount) accDAO.find(user2USBankAccount);
      user1CABankAccount = (CABankAccount) accDAO.find(user1CABankAccount);

      test((user1CABankAccount.getStatus()).equals(BankAccountStatus.UNVERIFIED), "AFEX failed set source account status to Unverified if no verifiedBy");
      test((user2USBankAccount.getStatus()).equals(BankAccountStatus.UNVERIFIED), "AFEX failed set destination account status to Unverified if no verifiedBy");
      user1CABankAccount.setStatus(BankAccountStatus.VERIFIED);
      accDAO.put(user1CABankAccount);
      user2USBankAccount.setStatus(BankAccountStatus.VERIFIED);
      accDAO.put(user2USBankAccount);
    }

    public void AFEXTransactionCompleted(){
      //cash in
      Transaction txn = new Transaction();
      txn.setAmount(100000L);
      txn.setSourceAccount(user1CABankAccount.getId());
      txn.setPayeeId(user1.getId());
      DigitalAccount digitalAccount = DigitalAccount.findDefault(x_, user1, "CAD");
      txn.setDestinationAccount(digitalAccount.getId());
      txn.setStatus(TransactionStatus.COMPLETED);
      txnDAO.put(txn);

      TransactionQuote quote = new TransactionQuote.Builder(x_).build();
      Transaction transaction = new Transaction.Builder(x_).build();
      transaction.setPayerId(user1.getId());
      transaction.setSourceAccount(user1CABankAccount.getId());
      transaction.setPayeeId(user2.getId());
      transaction.setDestinationAccount(user2USBankAccount.getId());
      transaction.setDestinationAmount(100l);
      transaction.setSourceCurrency("CAD");
      transaction.setDestinationCurrency("USD");
      quote.setRequestTransaction(transaction);
      quote.setDestinationAccount(user2USBankAccount);
      quote.setSourceAccount(user1CABankAccount);

      Transaction tx1 = (Transaction) planDAO.generateTransaction(x_, quote, afexService);
      Transaction tx2 = (tx1.getNext()[0]).getNext()[0].getNext()[0];

      tx2.setPlanner("13df0d76-ba3e-4287-b42e-c7ceff059dd8");//TODO: actually activate and plan with this planner
      tx2 = (AFEXTransaction) txnDAO.put(tx2).fclone();
      tx2.setStatus(TransactionStatus.COMPLETED);
      txnDAO.put(tx2);
      user2USBankAccount = (USBankAccount) accDAO.find(user2USBankAccount);
      user1CABankAccount = (CABankAccount) accDAO.find(user1CABankAccount);

      test((user1CABankAccount.getVerifiedBy()).equals("TRANSACTION"), "Source account verified by Completed AFEX transaction");
      test((user2USBankAccount.getVerifiedBy()).equals("TRANSACTION"), "Destination account verified by Completed AFEX transaction");
    }

    public void AFEXTransactionFailedWithVerifiedBy(){
      //cash in
      Transaction txn = new Transaction();
      txn.setAmount(100000L);
      txn.setSourceAccount(user1CABankAccount.getId());
      txn.setPayeeId(user1.getId());
      DigitalAccount digitalAccount = DigitalAccount.findDefault(x_, user1, "CAD");
      txn.setDestinationAccount(digitalAccount.getId());
      txn.setStatus(TransactionStatus.COMPLETED);
      txnDAO.put(txn);

      TransactionQuote quote = new TransactionQuote.Builder(x_).build();
      Transaction transaction = new Transaction.Builder(x_).build();
      transaction.setPayerId(user1.getId());
      transaction.setSourceAccount(user1CABankAccount.getId());
      transaction.setPayeeId(user2.getId());
      transaction.setDestinationAccount(user2USBankAccount.getId());
      transaction.setDestinationAmount(100l);
      transaction.setSourceCurrency("CAD");
      transaction.setDestinationCurrency("USD");
      quote.setRequestTransaction(transaction);
      quote.setDestinationAccount(user2USBankAccount);
      quote.setSourceAccount(user1CABankAccount);

      Transaction tx1 = (Transaction) planDAO.generateTransaction(x_, quote, afexService);
      Transaction tx2 = (tx1.getNext()[0]).getNext()[0].getNext()[0];

      tx2.setPlanner("13df0d76-ba3e-4287-b42e-c7ceff059dd8");//TODO: actually activate and plan with this planner
      tx2 = (AFEXTransaction) txnDAO.put(tx2).fclone();
      tx2.setStatus(TransactionStatus.FAILED);
      txnDAO.put(tx2);
      user2USBankAccount = (USBankAccount) accDAO.find(user2USBankAccount);
      user1CABankAccount = (CABankAccount) accDAO.find(user1CABankAccount);

      test((user1CABankAccount.getStatus()).equals(BankAccountStatus.VERIFIED), "Source account status stay verified even AFEX transaction Failed");
      test((user2USBankAccount.getStatus()).equals(BankAccountStatus.VERIFIED), "Destination account status stay verified even AFEX transaction Failed");
    }

}
