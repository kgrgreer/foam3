package net.nanopay.liquidity.tx;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.mlang.*;
import foam.mlang.expr.*;
import foam.mlang.predicate.*;
import foam.nanos.ruler.Operations;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.liquidity.tx.*;

import static foam.mlang.MLang.*;

/* 
  Test for RestrictEntitiesRule, creates a test rule with a source and destination account.
  Tries sending a transaction between those accounts which should throw a RuntimeException.
*/

public class RestrictEntitiesRuleTest
  extends Test
{
  Account sourceAccount_, destinationAccount_;
  ArraySink sourceAccountSink_, destinationAccountSink_;
  DAO accountDAO_, ruleDAO_, transactionDAO_, userDAO_;
  RestrictEntitiesRule rule_;
  Transaction transaction_;
  User sourceUser_, destinationUser_;
  X x_;

  public void runTest(X x) {
    accountDAO_ = (DAO) x.get("localAccountDAO");
    ruleDAO_ = (DAO) x.get("ruleDAO");
    transactionDAO_ = (DAO) x.get("localTransactionDAO");
    userDAO_ = (DAO) x.get("localUserDAO");
    x_ = x;

    // create source user which generates source account 
    sourceUser_ = (User) userDAO_.find(EQ(User.EMAIL, "sourceuser@nanopay.net"));
    if ( sourceUser_ == null ) {
      sourceUser_ = new User();
      sourceUser_.setEmail("sourceuser@nanopay.net");
    }
    sourceUser_ = (User) sourceUser_.fclone();
    sourceUser_.setFirstName("Source");
    sourceUser_.setLastName("User");
    sourceUser_.setGroup("admin");
    sourceUser_.setEmailVerified(true);
    userDAO_.put(sourceUser_);

    // create destination user which generates destination account
    destinationUser_ = (User) userDAO_.find(EQ(User.EMAIL, "destinationuser@nanopay.net"));
    if ( destinationUser_ == null ) {
      destinationUser_ = new User();
      destinationUser_.setEmail("destinationuser@nanopay.net");
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
    rule_ = new RestrictEntitiesRule();
    rule_.setId("Restrict Entities Test Rule");
    rule_.setDescription("Tests the RestrictEntitiesRule.");
    rule_.setSourceAccount(sourceAccount_.getId());
    rule_.setDestinationAccount(destinationAccount_.getId());
    rule_.setEnabled(true);
    ruleDAO_.put(rule_);

    // create test transaction
    transaction_ = new Transaction();
    transaction_.setSourceAccount(sourceAccount_.getId());
    transaction_.setDestinationAccount(destinationAccount_.getId());
    transaction_.setAmount(50000);
    transaction_.setStatus(TransactionStatus.COMPLETED);

    // make sure transaction throws expected RuntimeException
    test(
      TestUtils.testThrows(
        () -> transactionDAO_.put(transaction_),
        rule_.getId() + " restricting operation. " + rule_.getDescription(),
        RuntimeException.class
      ),
      "Send transaction between restricted entities throws RuntimeException."
    );
  }
}
