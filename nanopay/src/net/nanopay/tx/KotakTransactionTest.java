package net.nanopay.tx;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.User;
import foam.util.SafetyUtil;
import net.nanopay.approval.ApprovalRequest;
import net.nanopay.approval.ApprovalStatus;
import net.nanopay.bank.BankAccount;
import net.nanopay.bank.BankAccountStatus;
import net.nanopay.bank.CABankAccount;
import net.nanopay.bank.INBankAccount;
import net.nanopay.fx.FXQuote;
import net.nanopay.fx.KotakFxTransaction;
import net.nanopay.fx.ManualFxApprovalRequest;
import net.nanopay.tx.cico.CITransaction;
import net.nanopay.tx.cico.COTransaction;
import net.nanopay.tx.ComplianceTransaction;
import net.nanopay.tx.model.Transaction;
import net.nanopay.tx.model.TransactionStatus;

import static foam.mlang.MLang.AND;
import static foam.mlang.MLang.EQ;
import static foam.mlang.MLang.INSTANCE_OF;
import foam.dao.ArraySink;
import foam.util.SafetyUtil;

import java.util.Calendar;
import java.util.Date;

public class KotakTransactionTest extends foam.nanos.test.Test {
  CABankAccount sourceAccount;
  INBankAccount destinationAccount;
  User sender, receiver;
  DAO userDAO, accountDAO, txnDAO, approvalDAO, fxQuoteDAO;
  Transaction txn, txn2, txn3, txn4, txn5, txn6, txn7;
  KotakFxTransaction kotakTxn;
  ManualFxApprovalRequest approval;
  net.nanopay.fx.FXQuote quote;
  String senderEmail = "senderca@nanopay.net", receiverEmail = "receiverin@nanopay.net";
  ArraySink sink;

  public void runTest(X x) {
    userDAO = ((DAO) x.get("localUserDAO"));
    accountDAO = (DAO) x.get("localAccountDAO");
    txnDAO = ((DAO) x.get("localTransactionDAO"));
    approvalDAO = (DAO) x.get("approvalRequestDAO");
    fxQuoteDAO = (DAO) x.get("fxQuoteDAO");
    sender = addUserIfNotFound(x, senderEmail);
    receiver = addUserIfNotFound(x, receiverEmail);
    addCAAccountIfNotFound(x);
    addINAccountIfNotFound(x);
    createTxn(x);

    // test txn chain
    testTxnChain(x);

    // test approval requests for manual fx rate
    testApprovalRequests(x);

    // test fx quote
    testFXQuote(x);
  }

  public void testTxnChain(X x) {
    // test top level txn
    test( "".equals(txn.getParent()), "top level txn has no parent");
    test(txn.getClass() == SummaryTransaction.class, "top level txn is a SummaryTransaction");
    test(txn.getStatus() == TransactionStatus.COMPLETED, "top level txn has status COMPLETED");
    test(txn.getState(x)== TransactionStatus.PENDING, "top level txn has state PENDING");
    test(SafetyUtil.equals(txn.getSourceCurrency(), "CAD"), "top level txn has source currency CAD");
    test(SafetyUtil.equals(txn.getDestinationCurrency(), "INR"), "top level txn has destination currency INR");

    // test second txn in the chain
    sink = (foam.dao.ArraySink) txnDAO.where(EQ(Transaction.PARENT, txn.getId())).select(new foam.dao.ArraySink());
    test(sink.getArray().size() == 1, "txn2 is parent to a single transaction");
    txn2 = (Transaction) sink.getArray().get(0);
    test(txn2.getClass() == ComplianceTransaction.class, "txn2 is a ComplianceTransaction");
    test(txn2.getStatus() == TransactionStatus.PENDING, "txn2 has status PENDING");
    test(SafetyUtil.equals(txn2.getSourceCurrency(), "CAD"), "txn2 has source currency CAD");
    test(SafetyUtil.equals(txn2.getDestinationCurrency(), "INR"), "txn2 has destination currency INR");

    // test third txn in the chain
    sink = (foam.dao.ArraySink) txnDAO.where(EQ(Transaction.PARENT, txn2.getId())).select(new foam.dao.ArraySink());
    test(sink.getArray().size() == 1, "txn3 is parent to a single transaction");
    txn3 = (Transaction) sink.getArray().get(0);
    test(txn3 instanceof CITransaction, "txn3 is a CITransaction");
    test(txn3.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn3 has status PENDING");
    test(SafetyUtil.equals(txn3.getSourceCurrency(), "CAD"), "txn3 has source currency CAD");
    test(SafetyUtil.equals(txn3.getDestinationCurrency(), "CAD"), "txn3 has destination currency CAD");
    ;

    // test fourth txn in the chain
    sink = (foam.dao.ArraySink) txnDAO.where(EQ(Transaction.PARENT, txn3.getId())).select(new foam.dao.ArraySink());
    test(sink.getArray().size() == 1, "txn4 is parent to a single transaction");
    txn4 = (Transaction) sink.getArray().get(0);
    test(txn4 instanceof DigitalTransaction, "txn4 is a DigitalTransaction");
    test(txn4.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn4 has status PENDING_PARENT_COMPLETED");
    test(SafetyUtil.equals(txn4.getSourceCurrency(), "CAD"), "txn4 has source currency CAD");
    test(SafetyUtil.equals(txn4.getDestinationCurrency(), "CAD"), "txn4 has destination currency CAD");

    // test fifth txn in the chain
    sink = (foam.dao.ArraySink) txnDAO.where(EQ(Transaction.PARENT, txn4.getId())).select(new foam.dao.ArraySink());
    test(sink.getArray().size() == 1, "txn5 is parent to a single transaction");
    txn5 = (Transaction) sink.getArray().get(0);
    test(txn5 instanceof COTransaction, "txn5 is a COTransaction");
    test(txn5.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn5 has status PENDING_PARENT_COMPLETED");
    test(SafetyUtil.equals(txn5.getSourceCurrency(), "CAD"), "txn5 has source currency CAD");
    test(SafetyUtil.equals(txn5.getDestinationCurrency(), "CAD"), "txn5 has destination currency CAD");

    // test sixth txn in the chain
    sink = (foam.dao.ArraySink) txnDAO.where(EQ(Transaction.PARENT, txn5.getId())).select(new foam.dao.ArraySink());
    test(sink.getArray().size() == 1, "txn6 is parent to a single transaction");
    txn6 = (Transaction) sink.getArray().get(0);
    test(txn6 instanceof  KotakFxTransaction, "txn6 is a KotakFxTransaction");
    test(txn6.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn6 has status PENDING_PARENT_COMPLETED");
    test(SafetyUtil.equals(txn6.getSourceCurrency(), "CAD"), "txn6 has source currency CAD");
    test(SafetyUtil.equals(txn6.getDestinationCurrency(), "INR"), "txn6 has destination currency INR");

    // test last txn in the chain
    sink = (foam.dao.ArraySink) txnDAO.where(EQ(Transaction.PARENT, txn6.getId())).select(new foam.dao.ArraySink());
    test(sink.getArray().size() == 1, "txn7 is parent to a single transaction");
    txn7 = (Transaction) sink.getArray().get(0);
    test(txn7 instanceof KotakCOTransaction, "txn7 is a KotakCOTransaction");
    test(txn7.getStatus() == TransactionStatus.PENDING_PARENT_COMPLETED, "txn7 has status PENDING_PARENT_COMPLETED");
    test(SafetyUtil.equals(txn7.getSourceCurrency(), "INR"), "txn7 has source currency INR");
    test(SafetyUtil.equals(txn7.getDestinationCurrency(), "INR"), "txn7 has destination currency INR");
  }

  public void testApprovalRequests(X x) {
    approval = (ManualFxApprovalRequest) approvalDAO.find(
      AND(
        INSTANCE_OF(ManualFxApprovalRequest.class),
        EQ(ApprovalRequest.DAO_KEY, "transactionDAO"),
        EQ(ApprovalRequest.OBJ_ID, txn5.getId()),
        EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)
      ));
    test( approval == null, "Approval request for fx rate should not exist before fx transaction becomes PENDING.");

    txn6 = (KotakFxTransaction) txn6.fclone();
    txn6.setStatus(TransactionStatus.PENDING);
    txn6 = (Transaction) txnDAO.put_(x, txn6);
    test(! SafetyUtil.isEmpty(txn6.getId()), "Txn6 id not empty");
    approval = (ManualFxApprovalRequest) approvalDAO.find(
      AND(
        INSTANCE_OF(ManualFxApprovalRequest.class),
        EQ(ApprovalRequest.DAO_KEY, "transactionDAO"),
        EQ(ApprovalRequest.OBJ_ID, txn6.getId()),
        EQ(ApprovalRequest.STATUS, ApprovalStatus.REQUESTED)
      )).fclone();
    test(approval != null, "Approval request for fx rate has been created by CreateManualFxRule");

    // enter an fx rate
    approval.setFxRate(52.0);
    approval.setDealId("abcde");
    approval.setValueDate(new Date());
    Calendar cal = Calendar.getInstance();
    cal.setTime(new Date());
    cal.add(Calendar.DATE, 1);
    approval.setExpiryDate(cal.getTime());
    approval.setStatus(ApprovalStatus.APPROVED);
    approvalDAO.put_(x, approval);

    kotakTxn = (KotakFxTransaction) txnDAO.find(txn6.getId());
    test(kotakTxn.getFxRate() != 0, "Fx rate is successfully added through approval request");
    test(kotakTxn.getStatus().equals(TransactionStatus.COMPLETED), "Transaction updated to completed after fetching fx rate.");
  }

  public void testFXQuote(X x) {
    String id = kotakTxn.getFxQuoteId();
    test( ! SafetyUtil.isEmpty(id), "A quote id exists for kotak txn.");
    quote = (FXQuote) fxQuoteDAO.find(id);
    test(quote != null && quote.getRate() != 0, "A quote with non-zero fx rate exists for kotak txn.");
  }

  public User addUserIfNotFound(X x, String email) {
    User user = (User) userDAO.find(EQ(User.EMAIL, email));
    if ( user == null ) {
      user = new User();
      user.setEmail(email);
      user.setFirstName("Francis");
      user.setLastName("Filth");
      user.setEmailVerified(true);
    }
    return ((User) userDAO.put_(x, user));
  }

  public void addCAAccountIfNotFound(X x) {
    sourceAccount = (CABankAccount) accountDAO.find(
      AND(
        EQ(BankAccount.OWNER, sender.getId()),
        INSTANCE_OF(net.nanopay.bank.CABankAccount.class),
        EQ(BankAccount.DENOMINATION, "CAD")));
    if ( sourceAccount == null ) {
      sourceAccount = new CABankAccount();
      sourceAccount.setOwner(sender.getId());
      sourceAccount.setAccountNumber("87654321");
      sourceAccount.setStatus(BankAccountStatus.VERIFIED);
      sourceAccount = (CABankAccount) accountDAO.put_(x, sourceAccount);
    }
  }

  public void addINAccountIfNotFound(X x) {
    destinationAccount = (INBankAccount) accountDAO.find(
      AND(
        EQ(BankAccount.OWNER, receiver.getId()),
        INSTANCE_OF(net.nanopay.bank.INBankAccount.class),
        EQ(BankAccount.DENOMINATION, "INR")));
    if ( destinationAccount == null ) {
      destinationAccount = new INBankAccount();
      destinationAccount.setOwner(receiver.getId());
      destinationAccount.setAccountNumber("9876543210");
      destinationAccount.setStatus(BankAccountStatus.VERIFIED);
      destinationAccount = (INBankAccount) accountDAO.put_(x, destinationAccount);
    }
  }

  public void createTxn(X x) {
    txn = new Transaction();
    txn.setSourceAccount(sourceAccount.getId());
    txn.setSourceCurrency("CAD");
    txn.setDestinationAccount(destinationAccount.getId());
    txn.setDestinationCurrency("INR");
    txn.setAmount(200);
    txn = (Transaction) txnDAO.put_(x, txn);
  }
}
