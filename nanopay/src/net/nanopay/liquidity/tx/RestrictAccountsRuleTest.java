package net.nanopay.liquidity.tx;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.auth.LifecycleState;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

/*
  Test for RestrictAccountsRule, creates a test rule with a source and destination account.
  Tries sending a transaction between those accounts which should throw a RuntimeException.
*/

public class RestrictAccountsRuleTest
  extends Test
{
  Account sourceAccount_, destinationAccount_;
  ArraySink sourceAccountSink_, destinationAccountSink_;
  DAO accountDAO_, ruleDAO_, transactionDAO_, userDAO_;
  RestrictAccountsRule rule_;
  Transaction transaction_;
  User sourceUser_, destinationUser_, user_;
  X x_;

  public void runTest(X x) {
    accountDAO_ = (DAO) x.get("localAccountDAO");
    ruleDAO_ = (DAO) x.get("localRuleDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    userDAO_ = (DAO) x.get("localUserDAO");
    user_ = ((Subject) x.get("subject")).getUser();
    x_ = x;

    // create source user which generates source account
    sourceUser_ = (User) userDAO_.find(EQ(User.EMAIL, "source_account_test@nanopay.net"));
    if ( sourceUser_ == null ) {
      sourceUser_ = new User();
      sourceUser_.setEmail("source_account_test@nanopay.net");
    }
    sourceUser_ = (User) sourceUser_.fclone();
    sourceUser_.setFirstName("Source");
    sourceUser_.setLastName("User");
    sourceUser_.setGroup("admin");
    sourceUser_.setEmailVerified(true);
    userDAO_.put(sourceUser_);

    // create destination user which generates destination account
    destinationUser_ = (User) userDAO_.find(EQ(User.EMAIL, "destination_account_test@nanopay.net"));
    if ( destinationUser_ == null ) {
      destinationUser_ = new User();
      destinationUser_.setEmail("destination_account_test@nanopay.net");
    }
    destinationUser_ = (User) destinationUser_.fclone();
    destinationUser_.setFirstName("Destination");
    destinationUser_.setLastName("User");
    destinationUser_.setGroup("admin");
    destinationUser_.setEmailVerified(true);
    userDAO_.put(destinationUser_);

    // fetch source account
    sourceAccountSink_ = (ArraySink) sourceUser_.getAccounts(x_).where(
      AND(
        EQ(Account.TYPE, DigitalAccount.class.getSimpleName()),
        EQ(Account.IS_DEFAULT, true)
      )
    ).select(new ArraySink());
    sourceAccount_ = (Account) sourceAccountSink_.getArray().get(0);

    // fetch destination account
    destinationAccountSink_ = (ArraySink) destinationUser_.getAccounts(x_).where(
      AND(
        EQ(Account.TYPE, DigitalAccount.class.getSimpleName()),
        EQ(Account.IS_DEFAULT, true)
      )
    ).select(new ArraySink());
    destinationAccount_ = (Account) destinationAccountSink_.getArray().get(0);

    // create test rule to restrict source account from transacting with destination account
    rule_ = new RestrictAccountsRule();
    rule_.setId("121");
    rule_.setName("Restrict Accounts Test Rule");
    rule_.setDescription("Tests the RestrictAccountsRule.");
    rule_.setCreatedBy(user_.getId());
    rule_.setSourceAccount(sourceAccount_.getId());
    rule_.setDestinationAccount(destinationAccount_.getId());
    rule_.setEnabled(true);
    rule_.setLifecycleState(LifecycleState.ACTIVE);
    ruleDAO_.put(rule_);

    // create test transaction
    transaction_ = new Transaction();
    transaction_.setSourceAccount(sourceAccount_.getId());
    transaction_.setDestinationAccount(destinationAccount_.getId());
    transaction_.setAmount(50000);
    transaction_.setStatus(TransactionStatus.COMPLETED);
    //this test bypasses planners and built in validation
    transaction_.setPlanner("68afcf0c-c718-98f8-0841-75e97a3ad16d182");
    transaction_.setIsValid(true);

    // make sure transaction throws expected RuntimeException
    test(
      TestUtils.testThrows(
        () -> transactionDAO_.put(transaction_),
        "Operation prevented by business rule: " + rule_.getName(),
        RuntimeException.class
      ),
      "Send transaction between restricted accounts throws RuntimeException."
    );
  }
}
