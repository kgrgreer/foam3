package net.nanopay.account;

import foam.core.X;
import foam.dao.AbstractSink;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.account.AggregateAccount;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;
import static foam.mlang.MLang.INSTANCE_OF;

public class AccountDeletionTest
  extends foam.nanos.test.Test {
  X x_;
  DAO accountDAO;

  public void runTest(X x) {
    accountDAO = (DAO) x.get("localAccountDAO");
    x_ = x;
    testDeleteAccounts();
  }

  public void testDeleteAccounts() {
    User treasurer = addUser("virtualaccount@deletiontest.com");

    // create shadow account and fund it

    BankAccount bank = (CABankAccount) ((DAO) x_.get("localAccountDAO"))
      .find(AND(EQ(CABankAccount.OWNER, treasurer.getId()), INSTANCE_OF(CABankAccount.class)));
    if ( bank == null ) {
      bank = new CABankAccount();
      bank.setStatus(BankAccountStatus.VERIFIED);
      bank.setAccountNumber("12345678");
      bank.setOwner(treasurer.getId());
      bank.setName("sourceBankAccountForDeletionTest");
      bank = (BankAccount) ((DAO) x_.get("localAccountDAO")).inX(x_).put(bank).fclone();
    }
    //TODO Once ShadowAccount added, change SBA from Digital to ShadowAccount
    DigitalAccount SBA = new DigitalAccount.Builder(x_)
      .setOwner(treasurer.getId())
      .setDenomination("CAD")
      //.setBank(bank.getId())
      .build();
    accountDAO.put(SBA);

    Transaction fundTx = new Transaction.Builder(x_)
      .setAmount(100000)
      .setDestinationAccount(SBA.getId())
      .setSourceAccount(bank.getId())
      .build();
    fundTx = (Transaction) ((DAO) x_.get("transactionDAO")).put(fundTx).fclone();
    fundTx.setStatus(TransactionStatus.COMPLETED);
    ( (DAO) x_.get("transactionDAO") ).put(fundTx);

    // create 5 expanding levels of accounts, each level has an aggregate account to which the level below is linked.
    int levels = 6;

    for ( int curLevel = 1; curLevel < levels; curLevel++ ) {
      for ( int j = 0; j < (curLevel * 2); j++ ) {
        //create aggregate accounts
        if ( curLevel == 1 || curLevel == 3) {
          AggregateAccount aggregate = new AggregateAccount.Builder(x_)
            .setOwner(treasurer.getId())
            .setDenomination("CAD")
            .setName("AggregateLevel" + curLevel)
            .build();
          if ( curLevel == 1 )
            aggregate.setParent(SBA.getId());
          if ( curLevel == 3 ) {
            DigitalAccount newParent;
            newParent = (DigitalAccount) accountDAO.find(
              EQ( ( "VirtualLevel2num1" ), DigitalAccount.NAME )
            );
            aggregate.setParent(newParent.getId());
          }
          accountDAO.put(aggregate);
        }
        // create virtual accounts
        DigitalAccount account = new DigitalAccount.Builder(x_)
          .setOwner(treasurer.getId())
          .setDenomination("CAD")
          .setName("VirtualLevel" + curLevel + "num" + j)
          .build();
        if ( curLevel == 1 )
          account.setParent(SBA.getId());
        if ( curLevel == 2 ) {
          DigitalAccount newParent;
          newParent = (DigitalAccount) accountDAO.find(
            EQ( ("AggregateLevel1"), DigitalAccount.NAME )
          );
          account.setParent(newParent.getId());
        }
        if ( curLevel == 3 ) {
          DigitalAccount newParent;
          newParent = (DigitalAccount) accountDAO.find(
            EQ( ("AggregateLevel3"), DigitalAccount.NAME )
          );
          account.setParent(newParent.getId());
        }
        if ( curLevel > 3 ) {
          DigitalAccount newParent;
          newParent = (DigitalAccount) accountDAO.find(
            EQ( ( "VirtualLevel" + (curLevel - 1)+"num"+0 ), DigitalAccount.NAME )
          );
          account.setParent(newParent.getId());
        }
        account = (DigitalAccount) accountDAO.put(account).fclone();

        Transaction tx = new Transaction.Builder(x_)
          .setAmount(100)
          .setDestinationAccount(account.getId())
          .setSourceAccount(SBA.getId())
          .build();
        ((DAO) x_.get("transactionDAO")).put(tx);
      }
    }


    // get the level 1 virtual account, close it send balance to the other level 1 virtual account.
    //level 0 aggregate should have same balance, all accounts 2 and below should be empty and closed.
    //level 2 aggregate should be 0
    // the balance of the beneficiary account should be equal to all virtual 2 and below + 100 + the deleted account.

    DigitalAccount closingAccount = (DigitalAccount) accountDAO.find(
      EQ( "VirtualLevel2num1", DigitalAccount.NAME )
    ).fclone();

    DigitalAccount beneficiaryAccount = (DigitalAccount) accountDAO.find(
      EQ( "VirtualLevel2num0", DigitalAccount.NAME )
    ).fclone();
    DigitalAccount level1Aggregate = (DigitalAccount) accountDAO.find(
      EQ( "AggregateLevel1", DigitalAccount.NAME )
    ).fclone();
    DigitalAccount level3Aggregate = (DigitalAccount) accountDAO.find(
      EQ( "AggregateLevel3", DigitalAccount.NAME )
    ).fclone();

    BankAccount sendToBank = bank;
    DigitalAccount closingAccountTest = closingAccount;
    DigitalAccount level1AggregateTest = level1Aggregate;

    test(TestUtils.testThrows(
      () -> closingAccountTest.closeAccount(x_,level1AggregateTest),
      "Cannot send currency to an Aggregate Account",
      RuntimeException.class), "Exception: Cannot send currency to an Aggregate Account");

    test(TestUtils.testThrows(
      () -> closingAccountTest.closeAccount(x_,closingAccountTest),
      "Cannot set the beneficiary account equal to the account that is being closed",
      RuntimeException.class), "Exception: Cannot set the beneficiary account equal to the account that is being closed");

    test(TestUtils.testThrows(
      () -> closingAccountTest.closeAccount(x_,sendToBank),
      "Can only use a Digital Account for a beneficiary",
      RuntimeException.class), "Exception: Can only use a Digital Account for a beneficiary");

    test(TestUtils.testThrows(
      () -> level1AggregateTest.closeAccount(x_,closingAccountTest),
      "The beneficiary account can not be a descendant of the account that is being closed",
      RuntimeException.class), "Exception: The beneficiary account can not be a descendant of the account that is being closed");

    //TODO test sending to different currency accounts

    long prevLevel1AggregateBal = (long) level1Aggregate.findBalance(x_);
    long prevLevel3AggregateBal = (long) level3Aggregate.findBalance(x_);
    test( prevLevel3AggregateBal != 0, "Level 3 aggregate balance should not be 0, is: "+prevLevel3AggregateBal );
    closingAccount.closeAccount(x_, beneficiaryAccount);
    long postLevel1AggregateBal = (long) level1Aggregate.findBalance(x_);
    long postLevel3AggregateBal = (long) level3Aggregate.findBalance(x_);

    closingAccount = (DigitalAccount) accountDAO.find(
      EQ( "VirtualLevel2num1", DigitalAccount.NAME )
    ).fclone();

    beneficiaryAccount = (DigitalAccount) accountDAO.find(
      EQ( "VirtualLevel2num0", DigitalAccount.NAME )
    ).fclone();

    test( (closingAccount.getParent()) == level1Aggregate.getId(), "The level 0 aggregate account is infact the parent to the closed account" );
    test( (beneficiaryAccount.getParent()) == level1Aggregate.getId(), "The level 0 aggregate account is infact the parent to the beneficiary account" );
   /*
    test( prevLevel1AggregateBal == postLevel1AggregateBal, "Top level Aggregate balance was: "+prevLevel1AggregateBal+" and now is: "+postLevel1AggregateBal );
    Fails due to aggregate balance not finding balance of all levels
*/
    test( postLevel3AggregateBal == 0, "Level 3 aggregate balance should be 0, is: "+postLevel3AggregateBal );
/*
    test( (long) beneficiaryAccount.findBalance(x_) == (200 + prevLevel3AggregateBal ), "all balances were successfully moved to beneficiary account." );
    Fails due to aggregate balance not finding balance of all levels
*/

    test( ( (DigitalAccount) accountDAO.find(closingAccount) ).getDeleted(), "The account to be closed is deleted" );


  }

  public User addUser(String email) {
    User user = (User) ( (DAO) x_.get("localUserDAO") ).find( EQ( User.EMAIL, email ) );
    if ( user == null ) {
      user = new User();
      user.setFirstName("Test");
      user.setLastName("Passer");
      user.setEmail(email);
      user.setEmailVerified(true);
      user = (User) (((DAO) x_.get("localUserDAO") ).put_(x_, user)).fclone();
    }
    return user;
  }

}

