package net.nanopay.liquidity.tx;

import foam.core.X;
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
import net.nanopay.tx.test.TransactionTestUtil;
import net.nanopay.util.Frequency;

/*
  Test for TxLimitRule, creates a test rule with a source and destination user.
  Tries sending a transaction between the default accounts of each user which should throw a RuntimeException.
*/

public class TxLimitRuleTest
  extends Test
{
  public void runTest(X x) {
    this.testTransactionLimit(x, TxLimitEntityType.USER, true, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Sending user transaction with per tx limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, true, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Sending account transaction with per tx limits");
    this.testTransactionLimit(x, TxLimitEntityType.USER, false, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Receiving user transaction with per tx limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, false, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Receiving account transaction with per tx limits");

    this.testTransactionLimit(x, TxLimitEntityType.USER, true, Frequency.DAILY, 5000, new long[] { 2500, 2510 }, "Sending user transaction with daily limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, true, Frequency.DAILY, 5000, new long[] { 5001 }, "Sending account transaction with daily limits");
    this.testTransactionLimit(x, TxLimitEntityType.USER, false, Frequency.DAILY, 5000, new long[] { 100, 4999 }, "Receiving user transaction with daily limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, false, Frequency.DAILY, 5000, new long[] { 50, 50, 50, 4900 }, "Receiving account transaction with daily limits");

    this.testTransactionLimit(x, TxLimitEntityType.USER, true, Frequency.WEEKLY, 5000, new long[] { 100, 4950 }, "Sending user transaction with weeekly limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, true, Frequency.WEEKLY, 5000, new long[] { 1000, 1000, 1000, 1000, 1010 }, "Sending account transaction with weekly limits");
    this.testTransactionLimit(x, TxLimitEntityType.USER, false, Frequency.WEEKLY, 5000, new long[] { 4950, 100 }, "Receiving user transaction with weekly limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, false, Frequency.WEEKLY, 5000, new long[] { 10, 5000 }, "Receiving account transaction with weekly limits");
  }

  public void testTransactionLimit(X x, TxLimitEntityType entityType, boolean send, Frequency period, long limit, long[] txAmounts, String message) {
    DAO ruleDAO = (DAO) x.get("localRuleDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    // create source user which generates source account
    User sourceUser = TransactionTestUtil.setupTestUser(x, "source_user_limit@nanopay.net");
    User destinationUser = TransactionTestUtil.setupTestUser(x, "destination_user_limit@nanopay.net");

    // Create context with the source user for the transaction put
    Subject subject = new Subject.Builder(x).setUser(sourceUser).build();
    X sourceX = x.put("subject", subject);

    // fetch source account
    DigitalAccount sourceAccount = TransactionTestUtil.RetrieveDigitalAccount(x, sourceUser);
    DigitalAccount destinationAccount = TransactionTestUtil.RetrieveDigitalAccount(x, destinationUser, sourceAccount.getDenomination(),sourceAccount);

    // create test rule to restrict users from transacting
    TxLimitRule txLimitRule = new TxLimitRule();
    txLimitRule.setEnabled(true);
    txLimitRule.setName("Tx Limit Test Rule");
    txLimitRule.setDescription("Tx Limit Test Rule");
    txLimitRule.setApplyLimitTo(entityType);
    if (entityType == TxLimitEntityType.USER) {
      txLimitRule.setUserToLimit(send ? sourceUser.getId() : destinationUser.getId());
    } else if (entityType == TxLimitEntityType.ACCOUNT) {
      txLimitRule.setAccountToLimit(send ? sourceAccount.getId() : destinationAccount.getId());
    }
    txLimitRule.setDenomination("CAD");
    txLimitRule.setSend(send);
    txLimitRule.setLimit(limit);
    txLimitRule.setPeriod(period);
    txLimitRule.setLifecycleState(LifecycleState.ACTIVE);
    txLimitRule = (TxLimitRule) ruleDAO.put(txLimitRule);
    test( txLimitRule.getEnabled() && txLimitRule.getLifecycleState() == LifecycleState.ACTIVE,
          "Checking if rule is enabled: " + txLimitRule.getEnabled() + ", and active: " + txLimitRule.getLifecycleState());

    // create test transactions
    long spent = 0L;
    for (int i = 0; i < txAmounts.length - 1; i++)
    {
      Transaction transaction = new Transaction();
      transaction.setSourceAccount(sourceAccount.getId());
      transaction.setDestinationAccount(destinationAccount.getId());
      transaction.setSourceCurrency("CAD");
      transaction.setAmount(txAmounts[i]);
      transaction.setStatus(TransactionStatus.COMPLETED);
      transactionDAO.inX(sourceX).put(transaction);
      spent += txAmounts[i];
    }
    // create the last transaction which is expected to throw an exception
    Transaction transaction = new Transaction();
    transaction.setSourceAccount(sourceAccount.getId());
    transaction.setDestinationAccount(destinationAccount.getId());
    transaction.setSourceCurrency("CAD");
    transaction.setAmount(txAmounts[txAmounts.length - 1]);
    transaction.setStatus(TransactionStatus.COMPLETED);

    // Compute the error message
    String errorMessage =
          "The " +
          txLimitRule.getApplyLimitTo().getLabel().toLowerCase() + " " +
          txLimitRule.getPeriod().getLabel().toLowerCase() + " " +
          (txLimitRule.getSend() ? "sending" : "receiving") +
          " limit was exceeded.";

    // make sure transaction throws expected RuntimeException
    test(
      TestUtils.testThrows( () -> transactionDAO.inX(sourceX).put(transaction), errorMessage, RuntimeException.class ),
      message + " throws RuntimeException with error message: " + errorMessage
    );

    // Disable the rule
    txLimitRule = (TxLimitRule) txLimitRule.fclone();
    txLimitRule.setEnabled(false);
    txLimitRule = (TxLimitRule) ruleDAO.put(txLimitRule);
    test( !txLimitRule.getEnabled(), "Checking if rule is disabled: " + txLimitRule.getEnabled());
  }
}
