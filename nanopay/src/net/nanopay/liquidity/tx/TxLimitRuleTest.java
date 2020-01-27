package net.nanopay.liquidity.tx;

import foam.core.X;
import foam.core.Currency;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.test.Test;
import foam.test.TestUtils;
import foam.util.SafetyUtil;
import net.nanopay.account.Account;
import net.nanopay.account.DigitalAccount;
import net.nanopay.liquidity.tx.TxLimitEntityType;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.util.Frequency;
import net.nanopay.tx.test.TransactionTestUtil;

import static foam.mlang.MLang.*;

/*
  Test for TxLimitRule, creates a test rule with a source and destination user.
  Tries sending a transaction between the default accounts of each user which should throw a RuntimeException.
*/

public class TxLimitRuleTest
  extends Test
{
  public void runTest(X x) {
    this.testTransactionLimit(x, TxLimitEntityType.USER, true, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Sending user transaction with limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, true, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Sending account transaction with limits");
    //this.testTransactionLimit(x, TxLimitEntityType.TRANSACTION, true, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Sending transaction with global limits");
    this.testTransactionLimit(x, TxLimitEntityType.USER, false, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Receiving user transaction with limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, false, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Receiving account transaction with limits");
    //this.testTransactionLimit(x, TxLimitEntityType.TRANSACTION, false, Frequency.PER_TRANSACTION, 5000, new long[] { 5001 }, "Receiving transaction with global limits");

    this.testTransactionLimit(x, TxLimitEntityType.USER, true, Frequency.DAILY, 5000, new long[] { 2500, 2510 }, "Sending user transaction with limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, true, Frequency.DAILY, 5000, new long[] { 5001 }, "Sending account transaction with limits");
    //this.testTransactionLimit(x, TxLimitEntityType.TRANSACTION, true, Frequency.DAILY, 5000, new long[] { 4999, 5000 }, "Sending transaction with global limits");
    this.testTransactionLimit(x, TxLimitEntityType.USER, false, Frequency.DAILY, 5000, new long[] { 100, 4999 }, "Receiving user transaction with limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, false, Frequency.DAILY, 5000, new long[] { 50, 50, 50, 4900 }, "Receiving account transaction with limits");
    //this.testTransactionLimit(x, TxLimitEntityType.TRANSACTION, false, Frequency.DAILY, 5000, new long[] { 4900, 50, 50, 50 }, "Receiving transaction with global limits");

    this.testTransactionLimit(x, TxLimitEntityType.USER, true, Frequency.WEEKLY, 5000, new long[] { 100, 4950 }, "Sending user transaction with limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, true, Frequency.WEEKLY, 5000, new long[] { 1000, 1000, 1000, 1000, 1010 }, "Sending account transaction with limits");
    //this.testTransactionLimit(x, TxLimitEntityType.TRANSACTION, true, Frequency.WEEKLY, 5000, new long[] { 50, 50, 50, 50, 4850 }, "Sending transaction with global limits");
    this.testTransactionLimit(x, TxLimitEntityType.USER, false, Frequency.WEEKLY, 5000, new long[] { 4950, 100 }, "Receiving user transaction with limits");
    this.testTransactionLimit(x, TxLimitEntityType.ACCOUNT, false, Frequency.WEEKLY, 5000, new long[] { 10, 5000 }, "Receiving account transaction with limits");
    //this.testTransactionLimit(x, TxLimitEntityType.TRANSACTION, false, Frequency.WEEKLY, 5000, new long[] { 5000, 10 }, "Receiving transaction with global limits");
  }

  public void testTransactionLimit(X x, TxLimitEntityType entityType, boolean send, Frequency period, long limit, long[] txAmounts, String message) {
    User testUser = (User) x.get("user");
    DAO ruleDAO = (DAO) x.get("ruleDAO");
    DAO transactionDAO = (DAO) x.get("localTransactionDAO");

    // create source user which generates source account
    User sourceUser = TransactionTestUtil.setupTestUser(x, "source_user_limit@nanopay.net");
    User destinationUser = TransactionTestUtil.setupTestUser(x, "destination_user_limit@nanopay.net");

    // fetch source account
    Account sourceAccount = TransactionTestUtil.RetrieveDigitalAccount(x, sourceUser);
    Account destinationAccount = TransactionTestUtil.RetrieveDigitalAccount(x, destinationUser);
    
    // create test rule to restrict users from transacting
    TxLimitRule txLimitRule = new TxLimitRule();
    txLimitRule.setEnabled(true);
    txLimitRule.setId("Tx Limit Test Rule");
    txLimitRule.setDescription("Tx Limit Test Rule");
    txLimitRule.setCreatedBy(sourceUser.getId());
    txLimitRule.setApplyLimitTo(entityType);
    if (entityType == TxLimitEntityType.USER) {
      txLimitRule.setUserToLimit(sourceUser.getId());
    } else if (entityType == TxLimitEntityType.ACCOUNT) {
      txLimitRule.setAccountToLimit(sourceAccount.getId());
    }
    txLimitRule.setDenomination("CAD");
    txLimitRule.setSend(true);
    txLimitRule.setLimit(limit);
    txLimitRule.setPeriod(period);
    ruleDAO.put(txLimitRule);

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
      transactionDAO.put(transaction);
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
    DAO currencyDAO = ((DAO) x.get("currencyDAO"));
    Currency currency = (Currency) currencyDAO.find(transaction.getSourceCurrency());
    String availableLimit = currency.format(limit - spent);
    String txAmount = currency.format(transaction.getAmount());
    User user = txLimitRule.getSend() ? sourceUser : destinationUser;
    Account account = txLimitRule.getSend() ? sourceAccount : destinationAccount;
    long exceeded = transaction.getAmount() - (limit - spent);
    String errorMessage = 
      "The " + txLimitRule.getPeriod().getLabel().toLowerCase()
          + " limit was exceeded by " 
          + ( currency != null ? currency.format(exceeded) : String.format("%s", exceeded) )
          + " transaction " 
          + (txLimitRule.getSend() ? "from " : "to ")
          + txLimitRule.getApplyLimitTo().getLabel().toLowerCase() 
          + (txLimitRule.getApplyLimitTo() == TxLimitEntityType.USER ? " " + user.label() :
             txLimitRule.getApplyLimitTo() == TxLimitEntityType.ACCOUNT ? ! SafetyUtil.isEmpty(account.getName()) ? " " + account.getName() : " " + account.getId() : "")
          + ". Current available limit is " + availableLimit 
          + ". If you require further assistance, please contact your administrator.";

    // make sure transaction throws expected RuntimeException
    test(
      TestUtils.testThrows( () -> transactionDAO.put(transaction), errorMessage, RuntimeException.class ),
      message + " throws RuntimeException with error message: " + errorMessage
    );
  }
}
