package net.nanopay.tx;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.nanos.ruler.RuleGroup;
import foam.util.SafetyUtil;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.INBankAccount;
import net.nanopay.fx.*;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.cico.InterTrustTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;
import net.nanopay.tx.test.TransactionTestUtil;

public class KotakTransactionTest extends foam.nanos.test.Test {
  CABankAccount sourceAccount;
  INBankAccount destinationAccount;
  User sender, receiver;
  DAO userDAO, accountDAO, txnDAO, approvalDAO, fxQuoteDAO, planDAO, quoteDAO, ruleGroupDAO;
  Transaction txn, txn2, txn3, txn4, txn5, txn6, txn7;
  KotakFxTransaction kotakTxn;
  ManualFxApprovalRequest approval;
  net.nanopay.fx.FXQuote quote;
  ArraySink sink;

  public void runTest(X x) {
    ruleGroupDAO = ((DAO) x.get("ruleGroupDAO"));
    userDAO = ((DAO) x.get("localUserDAO"));
    accountDAO = (DAO) x.get("localAccountDAO");
    txnDAO = ((DAO) x.get("localTransactionDAO"));
    planDAO = ((DAO) x.get("localTransactionQuotePlanDAO"));
    approvalDAO = (DAO) x.get("approvalRequestDAO");
    fxQuoteDAO = (DAO) x.get("fxQuoteDAO");
    quoteDAO = (DAO) x.get("localTransactionPlannerDAO");
    RuleGroup kotak = (RuleGroup) ruleGroupDAO.find("KotakPlanner").fclone();
    kotak.setEnabled(true);
    ruleGroupDAO.put(kotak);
    DAO exchangeRateDAO = (DAO) x.get("exchangeRateDAO");
    ExchangeRate exchangeRate = new ExchangeRate();
    exchangeRate.setFromCurrency("CAD");
    exchangeRate.setToCurrency("INR");
    exchangeRate.setRate(55);
    exchangeRate.setFxProvider("nanopay");
    exchangeRateDAO.put(exchangeRate);
    sender = TransactionTestUtil.createUser(x);
    receiver = TransactionTestUtil.createUser(x);
    addCAAccountIfNotFound(x);
    addINAccountIfNotFound(x);
    Transaction plan = createTxn(x);

    // test txn chain
    testTxnChain(x, plan);

    kotak.setEnabled(false);
    ruleGroupDAO.put(kotak);
  }

  public void testTxnChain(X x, Transaction plan) {
    // test top level txn
    test( "".equals(plan.getParent()), "top level txn has no parent");
    test(plan.getClass() == FXSummaryTransaction.class, "top level txn is a FXSummaryTransaction. found: "+txn.getClass().getSimpleName());
    test(plan.getStatus() == TransactionStatus.COMPLETED, "top level txn has status COMPLETED. found: "+txn.getStatus());
    test(SafetyUtil.equals(plan.getSourceCurrency(), "CAD"), "top level txn has source currency CAD. found: "+plan.getSourceCurrency());
    test(SafetyUtil.equals(plan.getDestinationCurrency(), "INR"), "top level txn has destination currency INR. found: "+plan.getDestinationCurrency());

    // test second txn in the chain
    txn2 = (Transaction) plan.getNext()[0];
    test(txn2.getClass() == ComplianceTransaction.class, "txn2 is a ComplianceTransaction");
    test(txn2.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn2 has status PENDING");
    test(SafetyUtil.equals(txn2.getSourceCurrency(), "CAD"), "txn2 has source currency CAD");
    test(SafetyUtil.equals(txn2.getDestinationCurrency(), "INR"), "txn2 has destination currency INR");

    // test third txn in the chain
    txn3 = (Transaction) txn2.getNext()[0];
    test(txn3 instanceof CITransaction, "txn3 is a CITransaction");
    test(txn3.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn3 has status PENDING");
    test(SafetyUtil.equals(txn3.getSourceCurrency(), "CAD"), "txn3 has source currency CAD");
    test(SafetyUtil.equals(txn3.getDestinationCurrency(), "CAD"), "txn3 has destination currency CAD");
    ;

    // test fourth txn in the chain
    //TODO: isolate this test from others, then get rid of the intertrust check
    txn4 = (Transaction) txn3.getNext()[0];
    test((txn4 instanceof DigitalTransaction) || (txn4 instanceof InterTrustTransaction) , "txn4 is a DigitalTransaction");
    test(txn4.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn4 has status PENDING_PARENT_COMPLETED");
    test(SafetyUtil.equals(txn4.getSourceCurrency(), "CAD"), "txn4 has source currency CAD");
    test(SafetyUtil.equals(txn4.getDestinationCurrency(), "CAD"), "txn4 has destination currency CAD");

    // test fifth txn in the chain
    txn5 = (Transaction) txn4.getNext()[0];
    test(txn5 instanceof  KotakFxTransaction, "txn6 is a KotakFxTransaction");
    test(txn5.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn6 has status PENDING_PARENT_COMPLETED");
    test(SafetyUtil.equals(txn5.getSourceCurrency(), "CAD"), "txn6 has source currency CAD");
    test(SafetyUtil.equals(txn5.getDestinationCurrency(), "INR"), "txn6 has destination currency INR");

    // test sixth txn in the chain
    txn6 = (Transaction) txn5.getNext()[0];
    test(txn6 instanceof COTransaction, "txn5 is a COTransaction");
    test(txn6.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn5 has status PENDING_PARENT_COMPLETED");
    test(SafetyUtil.equals(txn6.getSourceCurrency(), "CAD"), "txn5 has source currency CAD");
    test(SafetyUtil.equals(txn6.getDestinationCurrency(), "CAD"), "txn5 has destination currency CAD");

    // test last txn in the chain
    txn7 = (Transaction) txn6.getNext()[0];
    test(txn7 instanceof KotakPaymentTransaction, "txn7 is a KotakPaymentTransaction");
    test(txn7.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn7 has status PENDING_PARENT_COMPLETED");
    test(SafetyUtil.equals(txn7.getSourceCurrency(), "INR"), "txn7 has source currency INR");
    test(SafetyUtil.equals(txn7.getDestinationCurrency(), "INR"), "txn7 has destination currency INR");
  }

  public void addCAAccountIfNotFound(X x) {
    sourceAccount = new CABankAccount();
    sourceAccount.setOwner(sender.getId());
    sourceAccount.setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED);
    sourceAccount.setAccountNumber("87654321");
    sourceAccount.setStatus(BankAccountStatus.VERIFIED);
    sourceAccount = (CABankAccount) accountDAO.put_(x, sourceAccount);
  }

  public void addINAccountIfNotFound(X x) {
    destinationAccount = new INBankAccount();
    destinationAccount.setStatus(net.nanopay.bank.BankAccountStatus.VERIFIED);
    destinationAccount.setOwner(receiver.getId());
    destinationAccount.setAccountNumber("9876543210");
    destinationAccount.setStatus(BankAccountStatus.VERIFIED);
    destinationAccount.setPurposeCode("P1306");
    destinationAccount.setForContact(true);
    destinationAccount = (INBankAccount) accountDAO.put_(x, destinationAccount);
  }

  public Transaction createTxn(X x) {
    txn = new Transaction();
    txn.setSourceAccount(sourceAccount.getId());
    txn.setSourceCurrency("CAD");
    txn.setDestinationAccount(destinationAccount.getId());
    txn.setDestinationCurrency("INR");
    txn.setDestinationAmount(200);
    TransactionQuote quote = new TransactionQuote();
    quote.setRequestTransaction(txn);
    try {
      quote = (TransactionQuote) quoteDAO.put(quote);
      return quote.getPlan();
    } catch ( net.nanopay.tx.planner.UnableToPlanException | net.nanopay.tx.planner.InvalidPlanException e ) {
      test(false, e.getMessage());
      throw e;
    }
  }
}
