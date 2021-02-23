package net.nanopay.liquidity.tx;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.Subject;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import foam.nanos.auth.LifecycleState;
import foam.test.TestUtils;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.tx.TransactionQuote;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.*;

/*
  Test for RestrictAccountsRule including child accounts, creates a test rule with the includeChildAccounts
  flag enabled on source and destination accounts. Ensures that parent account and child accounts of source
  account are restricted from sending transactions to the destination account and its children.
*/

public class RestrictAccountChildrenRuleTest
  extends Test
{
  Account sourceAccount_, destinationAccount_, sourceChildAccount_, destinationChildAccount_;
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
    sourceUser_ = (User) userDAO_.find(EQ(User.EMAIL, "source_account_child_test@nanopay.net"));
    if ( sourceUser_ == null ) {
      sourceUser_ = new User();
      sourceUser_.setEmail("source_account_child_test@nanopay.net");
    }
    sourceUser_ = (User) sourceUser_.fclone();
    sourceUser_.setFirstName("Source");
    sourceUser_.setLastName("User");
    sourceUser_.setGroup("admin");
    sourceUser_.setEmailVerified(true);
    userDAO_.put(sourceUser_);

    // create destination user which generates destination account
    destinationUser_ = (User) userDAO_.find(EQ(User.EMAIL, "destination_account_child_test@nanopay.net"));
    if ( destinationUser_ == null ) {
      destinationUser_ = new User();
      destinationUser_.setEmail("destination_account_child_test@nanopay.net");
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

    //create source child account
    sourceChildAccount_ = new Account.Builder(x_)
      .setName("Source Child Test Account")
      .setOwner(sourceUser_.getId())
      .setParent(sourceAccount_.getId())
      .setType("Digital Account")
      .setDenomination("CAD")
      .build();
    accountDAO_.put(sourceChildAccount_);


    // fetch destination account
    destinationAccountSink_ = (ArraySink) destinationUser_.getAccounts(x_).where(
      AND(
        EQ(Account.TYPE, DigitalAccount.class.getSimpleName()),
        EQ(Account.IS_DEFAULT, true)
      )
    ).select(new ArraySink());
    destinationAccount_ = (Account) destinationAccountSink_.getArray().get(0);

    // create destination child account
    destinationChildAccount_ = new Account.Builder(x_)
      .setName("Destination Child Test Account")
      .setOwner(destinationUser_.getId())
      .setParent(destinationAccount_.getId())
      .setType("Digital Account")
      .setDenomination("CAD")
      .build();
    accountDAO_.put(destinationChildAccount_);

    // create test rule to restrict source account & children from transacting with destination account and children
    rule_ = new RestrictAccountsRule();
    rule_.setId("1");
    rule_.setName("Restrict Accounts & Children Test Rule");
    rule_.setDescription("Tests the RestrictAccountsRule including child accounts.");
    rule_.setCreatedBy(user_.getId());
    rule_.setSourceAccount(sourceAccount_.getId());
    rule_.setIncludeSourceChildAccounts(true);
    rule_.setDestinationAccount(destinationAccount_.getId());
    rule_.setIncludeDestinationChildAccounts(true);
    rule_.setEnabled(true);
    rule_.setLifecycleState(LifecycleState.ACTIVE);
    ruleDAO_.put(rule_);

    transaction_ = new Transaction();
    transaction_.setSourceAccount(sourceChildAccount_.getId());
    transaction_.setDestinationAccount(destinationChildAccount_.getId());
    transaction_.setAmount(50000);
    transaction_.setStatus(TransactionStatus.COMPLETED);
    //this test bypasses planners and built in validation // THIS IS NOT POSSIBLE ANYMORE.
    transaction_.setPlanner("68afcf0c-c718-98f8-0841-75e97a3ad16d182");
    transaction_.setIsValid(true);
/*  TODO: Fix this test. planner bypass disallowed.
    test(
      TestUtils.testThrows(
        () -> transactionDAO_.put(transaction_),
        "Operation prevented by business rule: " + rule_.getName(),
        RuntimeException.class
      ),
      "Send transaction between restricted child accounts throws RuntimeException."
    );
    */
  }
}
